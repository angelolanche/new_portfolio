import { describe, expect, it } from 'vitest';
import {
  InstancedMesh,
  Mesh,
  Object3D,
  SphereGeometry,
  MeshBasicMaterial,
} from 'three';
import { TableWaterSimulation } from './tableWater';
import { impactTime, glassContactTime, sampleSpillMotion } from './spillMotion';
import {
  createTabletopWaterGeometry,
  updateTabletopWaterMesh,
} from './tabletopWaterMesh';
import {
  createPouringWaterGeometry,
  updatePouringWaterMesh,
} from './pouringWaterMesh';
import { updateFallingDroplets } from './fallingDroplets';
import {
  createEdgeCascadeGeometry,
  updateEdgeCascadeMesh,
} from './edgeCascadeMesh';
import { spillDuration } from './spillMotion';
import { glassPosition, tableRadius } from '../sceneLayout';
import { getGridCellPosition, waterGrid } from './waterGrid';
import { initialWaterVolume } from './cupWaterVolume';
import { sampleWaterRelease } from './waterRelease';
import { spillSettings } from './spillSettings';

describe('water rendering across the shared timeline', () => {
  it('reveals the spill after tipping and clears the visible water on replay', () => {
    const simulation = new TableWaterSimulation();
    const surface = createTabletopWaterGeometry();
    const stream = createPouringWaterGeometry();
    const streamMesh = new Mesh();
    const update = (time: number) => {
      simulation.advance(time);
      updateTabletopWaterMesh(surface, simulation);
      updatePouringWaterMesh(
        stream,
        streamMesh,
        simulation,
        sampleSpillMotion(simulation.time),
      );
    };
    update(impactTime);
    expect(surface.drawRange.count).toBe(0);
    expect(streamMesh.visible).toBe(false);
    update(glassContactTime + 0.2);
    expect(surface.drawRange.count).toBeGreaterThan(0);
    expect(streamMesh.visible).toBe(true);
    const indices = surface.getIndex()!;
    for (let index = 0; index < surface.drawRange.count; index++) {
      const vertex = indices.getX(index);
      if (
        vertex < simulation.wettableCells.length &&
        !simulation.wettableCells[vertex]
      )
        expect(surface.getAttribute('color').getW(vertex)).toBe(0);
    }
    update(spillDuration);
    expect(streamMesh.visible).toBe(false);
    update(0);
    expect(surface.drawRange.count).toBe(0);
    expect(streamMesh.visible).toBe(false);
    surface.dispose();
    stream.dispose();
    streamMesh.geometry.dispose();
    (streamMesh.material as MeshBasicMaterial).dispose();
  });

  it('draws a thin wet film on exposed wood without retaining old triangle normals', () => {
    const simulation = new TableWaterSimulation();
    const surface = createTabletopWaterGeometry();
    const patch = (x: number, z: number, depth: number) => {
      simulation.waterDepths.fill(0);
      for (let i = 0; i < simulation.waterDepths.length; i++) {
        const [cx, cz] = getGridCellPosition(i);
        if (
          Math.abs(cx - x) < 0.06 &&
          Math.abs(cz - z) < 0.06 &&
          simulation.wettableCells[i]
        )
          simulation.waterDepths[i] = depth;
      }
      updateTabletopWaterMesh(surface, simulation);
    };
    patch(-0.68, 0.2, 0.008);
    patch(-0.67, 0.27, 0.00002);
    expect(surface.drawRange.count).toBeGreaterThan(0);
    const fresh = surface.clone();
    fresh.setIndex(
      Array.from(surface.getIndex()!.array.slice(0, surface.drawRange.count)),
    );
    fresh.computeVertexNormals();
    const normals = surface.getAttribute('normal'),
      expected = fresh.getAttribute('normal');
    for (let i = 0; i < surface.drawRange.count; i++) {
      const vertex = surface.getIndex()!.getX(i);
      expect(normals.getX(vertex)).toBeCloseTo(expected.getX(vertex), 5);
      expect(normals.getY(vertex)).toBeCloseTo(expected.getY(vertex), 5);
      expect(normals.getZ(vertex)).toBeCloseTo(expected.getZ(vertex), 5);
    }
    const cellAt = (x: number, z: number) =>
      Math.round((z - waterGrid.z) / waterGrid.spacing) * waterGrid.columns +
      Math.round((x - waterGrid.x) / waterGrid.spacing);
    expect(simulation.wettableCells[cellAt(-0.15, -0.34)]).toBe(1);
    expect(simulation.wettableCells[cellAt(-0.4, -0.18)]).toBe(0);
    expect(simulation.wettableCells[cellAt(0.22, -0.12)]).toBe(0);
    surface.dispose();
    fresh.dispose();
  });
  it('keeps wet boundary cells visible instead of deleting squares next to obstacles', () => {
    const simulation = new TableWaterSimulation();
    const surface = createTabletopWaterGeometry();
    const column = Math.round((-0.65 - waterGrid.x) / waterGrid.spacing);
    const row = Math.round((0.1 - waterGrid.z) / waterGrid.spacing);
    const wet = row * waterGrid.columns + column;
    // A wet grid corner bordering an obstacle used to lose its complete triangles.
    simulation.waterDepths[wet] = 0.002;
    simulation.wettableCells[wet + 1] = 0;
    simulation.wettableCells[wet + waterGrid.columns] = 0;
    simulation.wettableCells[wet - 1] = 0;
    simulation.wettableCells[wet - waterGrid.columns] = 0;
    updateTabletopWaterMesh(surface, simulation);
    const active = Array.from(
      surface.getIndex()!.array.slice(0, surface.drawRange.count),
    );
    expect(active).toContain(wet);
    expect(surface.getAttribute('color').getW(wet)).toBeGreaterThan(0);
    expect(surface.getAttribute('color').getW(wet + 1)).toBe(0);
    expect(surface.getAttribute('color').getW(wet + waterGrid.columns)).toBe(0);
    surface.dispose();
  });
  it('clips every wet boundary triangle to the circular table rather than letting square cells overhang', () => {
    const simulation = new TableWaterSimulation();
    const surface = createTabletopWaterGeometry();
    for (let i = 0; i < simulation.waterDepths.length; i++) {
      const [x, z] = getGridCellPosition(i);
      if (simulation.wettableCells[i] && x < -0.64 && z > -0.1 && z < 0.4)
        simulation.waterDepths[i] = 0.003;
    }
    const before = simulation.surfaceVolume;
    updateTabletopWaterMesh(surface, simulation);
    const positions = surface.getAttribute('position'),
      colors = surface.getAttribute('color');
    const indices = surface.getIndex()!;
    expect(surface.drawRange.count).toBeGreaterThan(0);
    let clippedVertices = 0,
      rimVertices = 0;
    for (let i = 0; i < surface.drawRange.count; i++) {
      const v = indices.getX(i),
        r = Math.hypot(positions.getX(v), positions.getZ(v));
      expect(r).toBeLessThanOrEqual(tableRadius + 1e-6);
      expect(Number.isFinite(positions.getY(v))).toBe(true);
      if (v >= simulation.waterDepths.length) clippedVertices++;
      if (r > tableRadius - 0.0003 && colors.getW(v) > 0.1) rimVertices++;
    }
    expect(clippedVertices).toBeGreaterThan(0);
    expect(rimVertices).toBeGreaterThan(0);
    expect(simulation.surfaceVolume).toBe(before);
    surface.dispose();
  });
  it('reserves sparse detached tips for below the sheet instead of a shower at the lip', () => {
    const simulation = new TableWaterSimulation();
    const geometry = new SphereGeometry(1, 8, 6),
      material = new MeshBasicMaterial();
    const droplets = new InstancedMesh(
      geometry,
      material,
      spillSettings.droplets.maximumVisibleCount,
    );
    const transform = new Object3D();
    simulation.time = 10;
    for (let i = 0; i < 100; i++)
      simulation.droplets.push({
        x: -0.82,
        y: 0.845,
        z: i * 0.002,
        velocityX: -0.1,
        velocityY: -0.04,
        velocityZ: 0,
        volume: 1e-6,
        birthTime: 9.9,
      });
    updateFallingDroplets(droplets, transform, simulation);
    expect(droplets.count).toBe(0);
    for (let i = 0; i < simulation.droplets.length; i++)
      simulation.droplets[i].birthTime = 9.6 + i * 0.0005;
    updateFallingDroplets(droplets, transform, simulation);
    expect(droplets.count).toBeGreaterThan(0);
    expect(droplets.count).toBeLessThan(40);
    for (let i = 0; i < droplets.count; i++) {
      droplets.getMatrixAt(i, transform.matrix);
      transform.matrix.decompose(
        transform.position,
        transform.quaternion,
        transform.scale,
      );
      expect(transform.position.y).toBeLessThan(0.7);
      expect(transform.scale.y).toBeGreaterThan(transform.scale.x * 2);
    }
    droplets.dispose();
    geometry.dispose();
    material.dispose();
  });
  it('narrows and shortens the cascade as the rim flow decreases, then clears it', () => {
    const geometry = createEdgeCascadeGeometry();
    const simulation = new TableWaterSimulation();
    const bounds = (rate: number) => {
      simulation.droplets.length = 0;
      simulation.time = 10;
      for (let i = 0; i <= 40; i++)
        simulation.droplets.push({
          x: -Math.sqrt(tableRadius ** 2 - glassPosition[2] ** 2),
          y: 0.845,
          z: glassPosition[2],
          velocityX: -0.1,
          velocityY: -0.04,
          velocityZ: 0,
          volume: rate * 0.01,
          birthTime: 10 - (40 - i) * 0.01,
        });
      updateEdgeCascadeMesh(geometry, simulation);
      const positions = geometry.getAttribute('position'),
        colors = geometry.getAttribute('color');
      let low = Infinity,
        high = -Infinity,
        bottom = Infinity;
      for (let i = 0; i < positions.count; i++)
        if (colors.getW(i) > 0.03) {
          low = Math.min(low, positions.getZ(i));
          high = Math.max(high, positions.getZ(i));
          bottom = Math.min(bottom, positions.getY(i));
        }
      return { width: high - low, bottom };
    };
    const strong = bounds(0.001),
      weak = bounds(0.00003);
    expect(strong.width).toBeGreaterThan(weak.width * 1.5);
    expect(strong.bottom).toBeLessThan(weak.bottom - 0.05);
    simulation.droplets.length = 0;
    updateEdgeCascadeMesh(geometry, simulation);
    const colors = geometry.getAttribute('color');
    for (let i = 0; i < colors.count; i++) expect(colors.getW(i)).toBe(0);
    geometry.dispose();
  });
  it('keeps the main flow connected and limits breakup to the weak tail, with deterministic pause', () => {
    const geometry = createEdgeCascadeGeometry();
    const simulation = new TableWaterSimulation();
    const center = Math.atan2(glassPosition[2], -tableRadius);
    const prepare = (rate: number, remaining: number) => {
      simulation.time = 10;
      simulation.remainingCupVolume = initialWaterVolume * remaining;
      simulation.droplets.length = 0;
      for (let frame = 0; frame <= 40; frame++)
        for (let lane = -5; lane <= 5; lane++) {
          const angle = center + lane * 0.022;
          simulation.droplets.push({
            x: tableRadius * Math.cos(angle),
            y: 0.845,
            z: tableRadius * Math.sin(angle),
            velocityX: -0.1,
            velocityY: -0.04,
            velocityZ: 0,
            volume: (rate * 0.01) / 11,
            birthTime: 9.6 + frame * 0.01,
          });
        }
      updateEdgeCascadeMesh(geometry, simulation);
    };
    const gapsAt = (row: number) => {
      const colors = geometry.getAttribute('color');
      const wet = Array.from(
        { length: 25 },
        (_, col) => colors.getW(row * 25 + col) > 0.02,
      );
      const first = wet.indexOf(true),
        last = wet.lastIndexOf(true);
      return first < 0
        ? 0
        : wet.slice(first, last + 1).filter((value) => !value).length;
    };
    prepare(0.002, 0.9);
    expect(gapsAt(5)).toBe(0);
    prepare(0.00003, 0.08);
    let tears = 0;
    for (let row = 4; row < 16; row++) tears += gapsAt(row);
    expect(tears).toBeGreaterThan(0);
    const shape = geometry.getAttribute('position').array.slice();
    const coverage = geometry.getAttribute('color').array.slice();
    updateEdgeCascadeMesh(geometry, simulation);
    expect(geometry.getAttribute('position').array).toEqual(shape);
    expect(geometry.getAttribute('color').array).toEqual(coverage);
    simulation.time += 0.08;
    for (const drop of simulation.droplets) drop.birthTime += 0.08;
    updateEdgeCascadeMesh(geometry, simulation);
    expect(geometry.getAttribute('position').array).not.toEqual(shape);
    geometry.dispose();
  });
  it('releases a broad impulsive splash before settling into a narrower main stream', () => {
    const simulation = new TableWaterSimulation();
    const stream = createPouringWaterGeometry(),
      mesh = new Mesh();
    const cascade = createEdgeCascadeGeometry();
    const sample = (time: number) => {
      simulation.time = time;
      simulation.dischargeRate = 0.0007;
      simulation.pouringOrigin = [-0.65, 1.02, 0.1];
      simulation.remainingCupVolume = initialWaterVolume * 0.65;
      simulation.pouringSpeed = 0.15 + sampleWaterRelease(time).extraSpeed;
      simulation.droplets.length = 0;
      for (let i = 0; i < 60; i++)
        simulation.droplets.push({
          x: -Math.sqrt(tableRadius ** 2 - 0.1 ** 2),
          y: 0.845,
          z: 0.1,
          velocityX: -0.2,
          velocityY: -0.04,
          velocityZ: 0,
          volume: 0.0007 * 0.01,
          birthTime: time - (59 - i) * 0.01,
        });
      updatePouringWaterMesh(stream, mesh, simulation, sampleSpillMotion(time));
      updateEdgeCascadeMesh(cascade, simulation);
      const p = stream.getAttribute('position');
      let left = Infinity,
        near = Infinity,
        far = -Infinity;
      for (let i = 0; i < p.count; i++) {
        left = Math.min(left, p.getX(i));
        near = Math.min(near, p.getZ(i));
        far = Math.max(far, p.getZ(i));
      }
      const cp = cascade.getAttribute('position'),
        cc = cascade.getAttribute('color');
      let extent = 0;
      for (let i = 0; i < cp.count; i++)
        if (cc.getW(i) > 0.03)
          extent = Math.max(extent, Math.hypot(cp.getX(i), cp.getZ(i)));
      return { left, width: far - near, extent };
    };
    const initial = sample(glassContactTime - 0.08),
      main = sample(glassContactTime + 1.4);
    expect(initial.left).toBeLessThan(main.left - 0.03);
    expect(initial.width).toBeGreaterThan(main.width * 1.3);
    expect(initial.extent).toBeGreaterThan(main.extent + 0.015);
    stream.dispose();
    cascade.dispose();
    mesh.geometry.dispose();
    (mesh.material as MeshBasicMaterial).dispose();
  });
  it('removes falling droplets from the rendered instances after replay', () => {
    const simulation = new TableWaterSimulation();
    const geometry = new SphereGeometry(1, 8, 6);
    const material = new MeshBasicMaterial();
    const droplets = new InstancedMesh(
      geometry,
      material,
      spillSettings.droplets.maximumVisibleCount,
    );
    const transform = new Object3D();
    simulation.advance(glassContactTime + 0.7);
    updateFallingDroplets(droplets, transform, simulation);
    expect(droplets.count).toBeGreaterThan(0);
    simulation.advance(0);
    updateFallingDroplets(droplets, transform, simulation);
    expect(droplets.count).toBe(0);
    droplets.dispose();
    geometry.dispose();
    material.dispose();
  });
});
