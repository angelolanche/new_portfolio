import { describe, expect, it } from 'vitest';
import {
  Box3,
  Frustum,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from 'three';
import { createSpillVisibility, type SpillPart } from './spillVisibility';
import { TableWaterSimulation } from './tableWater';
import { CupWaterGeometry } from './CupWaterGeometry';
import {
  createTabletopWaterGeometry,
  updateTabletopWaterMesh,
} from './tabletopWaterMesh';
import {
  createPouringWaterGeometry,
  updatePouringWaterMesh,
} from './pouringWaterMesh';
import {
  createEdgeCascadeGeometry,
  updateEdgeCascadeMesh,
} from './edgeCascadeMesh';
import { sampleSpillMotion } from './spillMotion';
import { openingDuration, sampleOpening } from '../opening/cameraPath';
import { sampleLookRange } from '../opening/cameraLook';
import { glassPosition, tablePosition } from '../room/sceneLayout';

describe('water visibility without stale mesh bounds', () => {
  it('bounds all animated water and keeps every potentially visible part across camera paths and look extremes', () => {
    const visibility = createSpillVisibility();
    const simulation = new TableWaterSimulation();
    const geometries = {
      cup: new CupWaterGeometry(),
      surface: createTabletopWaterGeometry(),
      stream: createPouringWaterGeometry(),
      cascade: createEdgeCascadeGeometry(),
    };
    const stream = new Mesh(geometries.stream);
    const camera = new PerspectiveCamera();
    const root = new Matrix4(),
      cup = new Matrix4(),
      rotation = new Quaternion();
    const local = new Box3(),
      frustum = new Frustum();
    const point = new Vector3(),
      scale = new Vector3(1, 1, 1);
    const axes = { up: new Vector3(0, 1, 0), tilt: new Vector3(0, 0, 1) };
    let skipped = 0;
    for (let time = 0; time < openingDuration; time += 0.1) {
      simulation.advance(time);
      const pose = sampleSpillMotion(simulation.time);
      geometries.cup.update(
        simulation.waterSurfaceHeight,
        pose.angle,
        pose.slosh,
        pose.spin,
      );
      updateTabletopWaterMesh(geometries.surface, simulation);
      updatePouringWaterMesh(geometries.stream, stream, simulation, pose);
      updateEdgeCascadeMesh(geometries.cascade, simulation);
      root.makeTranslation(
        tablePosition[0] + pose.jolt,
        tablePosition[1],
        tablePosition[2],
      );
      rotation
        .setFromAxisAngle(axes.tilt, pose.angle)
        .premultiply(new Quaternion().setFromAxisAngle(axes.up, pose.yaw))
        .multiply(new Quaternion().setFromAxisAngle(axes.up, -pose.spin));
      cup.compose(
        new Vector3(pose.x, glassPosition[1] + pose.lift, pose.z),
        rotation,
        scale,
      );
      visibility.sample(camera, root, simulation, pose);
      const exact = {} as Record<SpillPart, Box3>;
      for (const part of Object.keys(geometries) as SpillPart[]) {
        const geometry = geometries[part],
          positions = geometry.getAttribute('position');
        const count =
          part === 'cup' || part === 'surface'
            ? geometry.drawRange.count
            : positions.count;
        local.makeEmpty();
        for (let i = 0; i < count; i++) {
          point.fromBufferAttribute(
            positions,
            part === 'surface' ? geometry.getIndex()!.getX(i) : i,
          );
          if (part === 'cup') point.applyMatrix4(cup);
          local.expandByPoint(point);
        }
        if (!local.isEmpty())
          expect(
            visibility.bounds[part].containsBox(local),
            `${part} at ${time}`,
          ).toBe(true);
        exact[part] = local.clone().applyMatrix4(root);
      }
      for (const aspect of [16 / 9, 4 / 3, 1, 390 / 844, 21 / 9]) {
        const view = sampleOpening(time, aspect);
        for (const [x, y] of [
          [0, 0],
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]) {
          camera.aspect = aspect;
          camera.fov = view.fov;
          camera.updateProjectionMatrix();
          camera.position.copy(view.position);
          camera.lookAt(view.target);
          const range = sampleLookRange(time);
          camera.rotateOnWorldAxis(axes.up, x * range.horizontal);
          camera.rotateX(y * range.vertical);
          const shown = visibility.sample(camera, root, simulation, pose);
          frustum.setFromProjectionMatrix(
            new Matrix4().multiplyMatrices(
              camera.projectionMatrix,
              camera.matrixWorldInverse,
            ),
          );
          for (const part of Object.keys(exact) as SpillPart[]) {
            if (!shown[part]) skipped++;
            if (!exact[part].isEmpty() && frustum.intersectsBox(exact[part]))
              expect(
                shown[part],
                `${part} at ${time}, aspect ${aspect}, look ${x}/${y}`,
              ).toBe(true);
          }
        }
      }
    }
    expect(skipped).toBeGreaterThan(0);
    Object.values(geometries).forEach((g) => g.dispose());
    (stream.material as { dispose: () => void }).dispose();
  });

  it('restores visibility when looking back at the same time without changing water state', () => {
    const simulation = new TableWaterSimulation();
    simulation.advance(6);
    const visibility = createSpillVisibility();
    const camera = new PerspectiveCamera(60, 16 / 9, 0.03, 400);
    const root = new Matrix4().makeTranslation(...tablePosition);
    camera.position.set(tablePosition[0], 2, tablePosition[2] + 5);
    const target = new Vector3(...tablePosition).add(new Vector3(0, 0.85, 0));
    const sample = () =>
      visibility.sample(
        camera,
        root,
        simulation,
        sampleSpillMotion(simulation.time),
      );
    const depths = simulation.waterDepths.slice();
    camera.lookAt(target);
    expect(Object.values(sample()).every(Boolean)).toBe(true);
    camera.lookAt(camera.position.clone().add(new Vector3(0, 0, 5)));
    expect(Object.values(sample()).some(Boolean)).toBe(false);
    camera.lookAt(target);
    expect(Object.values(sample()).every(Boolean)).toBe(true);
    expect(simulation.waterDepths).toEqual(depths);
  });
});
