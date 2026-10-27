import { PerspectiveCamera, Vector3 } from 'three';
import { expect, it } from 'vitest';
import {
  signalTitleScale,
  titleWidth,
  titleHeight,
  titleDepth,
  titleHorizontalPadding,
} from './signalTitleLayout';

it('reduces only a modest amount of the white side margins and retains a fully visible title on entry', () => {
  const previousPadding = 0.6;
  const marginReduction =
    (previousPadding - titleHorizontalPadding) / previousPadding;
  expect(marginReduction).toBeGreaterThan(0.15);
  expect(marginReduction).toBeLessThan(0.4);
  for (const aspect of [0.4, 9 / 16, 1, 4 / 3, 16 / 9, 32 / 9]) {
    const camera = new PerspectiveCamera(
      aspect < 1 ? 54 : 50,
      aspect,
      0.03,
      400,
    );
    camera.position.z = 6.5;
    camera.updateMatrixWorld();
    const scale = signalTitleScale(aspect);
    for (const x of [-1, 1])
      for (const y of [-1, 1]) {
        const corner = new Vector3(
          x * (titleWidth / 2 + titleHorizontalPadding) * scale,
          ((y * (titleHeight + 0.1)) / 2) * scale,
          (titleDepth / 2) * scale,
        ).project(camera);
        expect(Math.abs(corner.x)).toBeLessThan(0.92);
        expect(Math.abs(corner.y)).toBeLessThan(1);
      }
  }
});
