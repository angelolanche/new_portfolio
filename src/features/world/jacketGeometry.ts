import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
  DoubleSide,
} from 'three';
import { createFinishedBox } from './finishedGeometry';

// Match the approved upholstered back, including its arch and tapered shoulders.
export function createJacketSupport() {
  const geometry = createFinishedBox([1.05, 0.85, 0.22], 0.22 * 0.42);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      across = Math.min(1, Math.abs(x / 0.525));
    p.setXYZ(
      i,
      x * (1 - 0.035 * (y / 0.85 + 0.5)),
      y - 0.85 * 0.2 * across ** 3 * (y / 0.85 + 0.5) + 0.9,
      p.getZ(i) + 0.36,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createJacketSurface() {
  const support = createJacketSupport(),
    material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(support, material);
  mesh.updateMatrixWorld();
  const ray = new Raycaster();
  function point(u: number, t: number, lift = 0) {
    const x = 0.025 + u * 0.62;
    const angle = -1.5 + t * 3.85;
    const direction = new Vector3(0, Math.cos(angle), Math.sin(angle));
    const center = new Vector3(x, 0.9, 0.36);
    ray.set(
      center.clone().addScaledVector(direction, 2),
      direction.clone().negate(),
    );
    const hit = ray.intersectObject(mesh)[0];
    if (!hit) throw new Error('Jacket must remain supported by the backrest');
    // Narrow contact valleys and small irregular folds; no floating rigid panels.
    const fold =
      0.006 *
      (0.5 + 0.5 * Math.sin(u * 55 + t * 9)) ** 2 *
      Math.sin(Math.PI * t) ** 2;
    return hit.point.clone().addScaledVector(direction, 0.0015 + fold + lift);
  }
  function panel(
    map: (u: number, t: number) => [number, number, number?],
    columns = 32,
    rows = 48,
  ) {
    const positions: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= columns; i++) {
        const u = i / columns,
          t = j / rows,
          [across, along, lift] = map(u, t);
        positions.push(...point(across, along, lift).toArray());
        uv.push(u * 0.9, t * 1.4);
      }
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < columns; i++) {
        const a = j * (columns + 1) + i,
          b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  return {
    point,
    panel,
    dispose: () => {
      support.dispose();
      material.dispose();
    },
  };
}
