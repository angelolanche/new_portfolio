import { spillSettings } from './spillSettings';
import { BufferAttribute, BufferGeometry } from 'three';
import { tableRadius } from '../sceneLayout';
import { TableWaterSimulation } from './tableWater';
import { getGridCellPosition, waterGrid } from './waterGrid';

type WaterVertex = { x: number; z: number; depth: number; index: number };
const gridCount = waterGrid.columns * waterGrid.rows;
const triangleCount = (waterGrid.columns - 1) * (waterGrid.rows - 1) * 2;
const maximumVertices = gridCount + triangleCount * 10;
const contourDepth = 0.000001;
// An inscribed polygon clips the surface to the circular tabletop (error < 0.25 mm).
const rimPlanes = Array.from({ length: 128 }, (_, i) => ({
  x: Math.cos((i * Math.PI) / 64),
  z: Math.sin((i * Math.PI) / 64),
}));
const rimDistance = tableRadius * Math.cos(Math.PI / 128);

export function createTabletopWaterGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(maximumVertices * 3), 3),
  );
  geometry.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(maximumVertices * 3), 3),
  );
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(maximumVertices * 4), 4),
  );
  geometry.setIndex(
    new BufferAttribute(new Uint32Array(triangleCount * 24), 1),
  );
  geometry.setDrawRange(0, 0);
  return geometry;
}

function clipPolygon(
  polygon: WaterVertex[],
  distance: (v: WaterVertex) => number,
) {
  const result: WaterVertex[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length];
    const da = distance(a),
      db = distance(b);
    if (da >= 0) result.push(a);
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db);
      result.push({
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        depth: a.depth + (b.depth - a.depth) * t,
        index: -1,
      });
    }
  }
  return result;
}

export function updateTabletopWaterMesh(
  surfaceGeometry: BufferGeometry,
  simulation: TableWaterSimulation,
) {
  const positions = surfaceGeometry.getAttribute('position');
  const colors = surfaceGeometry.getAttribute('color');
  const normals = surfaceGeometry.getAttribute('normal');
  const visibleDepths = new Float64Array(gridCount);
  for (let i = 0; i < gridCount; i++) {
    if (!simulation.wettableCells[i]) continue;
    let total = simulation.waterDepths[i] * 4,
      weight = 4;
    const row = Math.floor(i / waterGrid.columns),
      column = i % waterGrid.columns;
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++) {
        if (
          (!dx && !dz) ||
          row + dz < 0 ||
          row + dz >= waterGrid.rows ||
          column + dx < 0 ||
          column + dx >= waterGrid.columns
        )
          continue;
        const j = i + dz * waterGrid.columns + dx;
        if (simulation.wettableCells[j]) {
          total += simulation.waterDepths[j];
          weight++;
        }
      }
    visibleDepths[i] = total / weight;
  }
  const vertices: WaterVertex[] = [];
  const writeVertex = (v: WaterVertex) => {
    positions.setXYZ(
      v.index,
      v.x,
      spillSettings.water.puddleBaseHeight + v.depth,
      v.z,
    );
    colors.setXYZW(
      v.index,
      1,
      1,
      1,
      Math.min(1, Math.max(0, (v.depth - contourDepth) / 0.00035)),
    );
  };
  for (let i = 0; i < gridCount; i++) {
    const [x, z] = getGridCellPosition(i);
    const v = { x, z, depth: visibleDepths[i], index: i };
    vertices.push(v);
    writeVertex(v);
  }
  const indices = surfaceGeometry.getIndex()!;
  const intersections = new Map<string, number>();
  let vertexCount = gridCount,
    indexCount = 0;
  for (let row = 0; row < waterGrid.rows - 1; row++)
    for (let column = 0; column < waterGrid.columns - 1; column++) {
      const i = row * waterGrid.columns + column;
      for (const corners of [
        [i, i + waterGrid.columns, i + 1],
        [i + 1, i + waterGrid.columns, i + waterGrid.columns + 1],
      ]) {
        if (!corners.some((v) => visibleDepths[v] > contourDepth)) continue;
        let polygon = clipPolygon(
          corners.map((v) => vertices[v]),
          (v) => v.depth - contourDepth,
        );
        if (polygon.some((v) => Math.hypot(v.x, v.z) > rimDistance)) {
          for (const plane of rimPlanes) {
            polygon = clipPolygon(
              polygon,
              (v) => rimDistance - v.x * plane.x - v.z * plane.z,
            );
            if (!polygon.length) break;
          }
        }
        if (polygon.length < 3) continue;
        for (const v of polygon)
          if (v.index < 0) {
            const key =
              Math.round(v.x * 1e8) +
              ':' +
              Math.round(v.z * 1e8) +
              ':' +
              Math.round(v.depth * 1e8);
            const existing = intersections.get(key);
            if (existing !== undefined) v.index = existing;
            else {
              v.index = vertexCount++;
              intersections.set(key, v.index);
              writeVertex(v);
            }
          }
        for (let j = 1; j < polygon.length - 1; j++) {
          indices.setX(indexCount++, polygon[0].index);
          indices.setX(indexCount++, polygon[j].index);
          indices.setX(indexCount++, polygon[j + 1].index);
        }
      }
    }
  indices.array.fill(0, indexCount);
  // Compute normals only for the current triangles, not unused buffer capacity.
  normals.array.fill(0);
  for (let i = 0; i < indexCount; i += 3) {
    const a = indices.getX(i),
      b = indices.getX(i + 1),
      c = indices.getX(i + 2);
    const ux = positions.getX(b) - positions.getX(a),
      uy = positions.getY(b) - positions.getY(a),
      uz = positions.getZ(b) - positions.getZ(a);
    const vx = positions.getX(c) - positions.getX(a),
      vy = positions.getY(c) - positions.getY(a),
      vz = positions.getZ(c) - positions.getZ(a);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    for (const v of [a, b, c])
      normals.setXYZ(
        v,
        normals.getX(v) + nx,
        normals.getY(v) + ny,
        normals.getZ(v) + nz,
      );
  }
  for (let i = 0; i < vertexCount; i++) {
    const x = normals.getX(i),
      y = normals.getY(i),
      z = normals.getZ(i);
    const length = Math.hypot(x, y, z) || 1;
    normals.setXYZ(i, x / length, y / length, z / length);
  }
  indices.needsUpdate = true;
  positions.needsUpdate = true;
  colors.needsUpdate = true;
  normals.needsUpdate = true;
  surfaceGeometry.setDrawRange(0, indexCount);
}
