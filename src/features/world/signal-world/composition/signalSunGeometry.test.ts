import { expect, it } from 'vitest';
import { createSignalSunGeometry } from './signalSunGeometry';

it('builds a volumetric sun with a long radial corona and valid surface normals', () => {
  const geometry = createSignalSunGeometry();
  try {
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    expect(bounds.max.x - bounds.min.x).toBeGreaterThan(25);
    expect(bounds.max.y - bounds.min.y).toBeGreaterThan(20);
    expect(bounds.max.z - bounds.min.z).toBeGreaterThan(15);
    expect(geometry.boundingSphere!.radius).toBeLessThan(14);
    const normals = geometry.getAttribute('normal');
    for (let i = 0; i < normals.count; i++) {
      const length = Math.hypot(
        normals.getX(i),
        normals.getY(i),
        normals.getZ(i),
      );
      expect(length).toBeCloseTo(1, 5);
    }
  } finally {
    geometry.dispose();
  }
});
