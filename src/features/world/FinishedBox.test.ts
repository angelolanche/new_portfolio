import { describe, expect, it } from 'vitest';
import { createFinishedBox } from './finishedGeometry';

describe('finished room geometry', () => {
  it.each([
    { size: [2.8, 0.96, 0.32] as [number, number, number], radius: 0.13 },
    { size: [0.48, 0.13, 0.36] as [number, number, number], radius: 0.045 },
    { size: [0.012, 0.008, 8.6] as [number, number, number], radius: 0.012 },
    { size: [6.7, 3.2, 0.15] as [number, number, number], radius: 0 },
  ])(
    'preserves the approved object envelope and finite texture coordinates: $size',
    ({ size, radius }) => {
      const geometry = createFinishedBox(size, radius);
      const positions = geometry.getAttribute('position');
      const uv = geometry.getAttribute('uv');
      for (let i = 0; i < positions.count; i++) {
        expect(Math.abs(positions.getX(i))).toBeLessThanOrEqual(
          size[0] / 2 + 1e-6,
        );
        expect(Math.abs(positions.getY(i))).toBeLessThanOrEqual(
          size[1] / 2 + 1e-6,
        );
        expect(Math.abs(positions.getZ(i))).toBeLessThanOrEqual(
          size[2] / 2 + 1e-6,
        );
        expect(Number.isFinite(uv.getX(i)) && Number.isFinite(uv.getY(i))).toBe(
          true,
        );
      }
      geometry.dispose();
    },
  );
});
