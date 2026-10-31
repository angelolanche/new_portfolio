import { PerspectiveCamera, Vector3 } from 'three';
import { expect, it } from 'vitest';
import {
  instructionWidth,
  instructionHeight,
  instructionY,
  signalInstructionLayout,
} from './signalInstructionTexture';
import { signalTitleScale, titleHeight, titleWidth } from './signalTitleLayout';

it('keeps instructions below the larger title and inside the entry view on wide and narrow screens', () => {
  expect(instructionWidth).toBeLessThan(titleWidth * 0.75);
  expect(instructionY + instructionHeight / 2).toBeLessThan(
    -titleHeight / 2 - 0.2,
  );
  for (const aspect of [0.4, 9 / 16, 1, 4 / 3, 16 / 9, 32 / 9]) {
    const camera = new PerspectiveCamera(
      aspect < 1 ? 54 : 50,
      aspect,
      0.03,
      400,
    );
    camera.position.set(0, 0, 6.5);
    camera.updateMatrixWorld();
    const scale = signalTitleScale(aspect);
    for (const x of [-1, 1])
      for (const y of [-1, 1]) {
        const corner = new Vector3(
          ((x * instructionWidth) / 2) * scale,
          1.05 + (instructionY + (y * instructionHeight) / 2) * scale,
          0,
        ).project(camera);
        expect(Math.abs(corner.x)).toBeLessThan(1);
        expect(Math.abs(corner.y)).toBeLessThan(1);
      }
  }
});

it('makes touch instructions larger and closer to the viewer without changing desktop layout', () => {
  const desktop = signalInstructionLayout(false);
  const mobile = signalInstructionLayout(true);
  expect(desktop.map(({ width, height }) => [width, height])).toEqual([
    [3.3, 0.48],
    [3.95, 0.48],
    [3, 0.48],
  ]);
  mobile.forEach((block, index) => {
    expect(block.width).toBeGreaterThan(desktop[index].width);
    expect(block.height).toBeGreaterThan(desktop[index].height);
    expect(block.position[2]).toBeGreaterThan(desktop[index].position[2]);
  });
});
