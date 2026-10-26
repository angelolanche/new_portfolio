import { expect, it } from 'vitest';
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { createJacketSupport, createJacketSurface } from './jacketGeometry';

it('drapes over the actual curved backrest with contact valleys and no penetration', () => {
  const surface = createJacketSurface();
  const geometry = createJacketSupport(),
    material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  const ray = new Raycaster();
  let closest = Infinity;
  for (let i = 0; i <= 24; i++)
    for (let j = 0; j <= 40; j++) {
      const u = -0.65 + (i / 24) * 1.3,
        t = j / 40;
      const p = surface.point(u, t);
      const center = new Vector3(p.x, 0.9, 0.36),
        direction = p.clone().sub(center).normalize();
      ray.set(
        center.clone().addScaledVector(direction, 2),
        direction.clone().negate(),
      );
      const hit = ray.intersectObject(mesh)[0];
      expect(hit).toBeDefined();
      const gap = p.distanceTo(center) - hit.point.distanceTo(center);
      expect(gap).toBeGreaterThanOrEqual(0.0014);
      expect(gap).toBeLessThan(0.008);
      closest = Math.min(closest, gap);
    }
  expect(closest).toBeLessThan(0.0016);
  surface.dispose();
  geometry.dispose();
  material.dispose();
});
