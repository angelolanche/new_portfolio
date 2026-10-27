import { Euler, PerspectiveCamera, Vector3 } from 'three';
import { expect, it } from 'vitest';
import { signalCameraOffset } from '../navigation/signalNavigation';
import { signalSunPosition } from '../signalLayout';
import { sampleFloat } from '../signalFloat';
import {
  sunInstructionBlocks,
  sunInstructionPitch,
  sunInstructionScale,
  sunInstructionY,
} from './sunInstructionLayout';

it('keeps both keyboard clusters in the final viewport throughout their float motion', () => {
  for (const aspect of [0.4, 9 / 16, 1, 4 / 3, 16 / 9, 32 / 9]) {
    const fov = (aspect < 1 ? 54 : 50) + Math.max(0, 1 - aspect) * 35;
    const camera = new PerspectiveCamera(fov, aspect, 0.03, 400);
    signalCameraOffset(1, camera.position);
    camera.position.z -= 1.5;
    camera.rotation.x = sunInstructionPitch;
    camera.updateMatrixWorld();
    for (const time of [0, 8, 20, 32])
      for (const [i, block] of sunInstructionBlocks.entries()) {
        const offset = new Vector3(),
          rotation = new Vector3();
        sampleFloat(
          time,
          i < 5 ? 241 : 246,
          block.height * 0.16,
          offset,
          rotation,
        );
        for (const x of [-1, 1])
          for (const y of [-1, 1]) {
            const point = new Vector3(
              (x * block.width) / 2,
              (y * block.height) / 2,
              0,
            )
              .applyEuler(new Euler(rotation.x, rotation.y, rotation.z))
              .add(new Vector3(block.x, block.y, 0))
              .add(offset)
              .multiplyScalar(sunInstructionScale(aspect))
              .add(new Vector3(0, sunInstructionY, 0))
              .applyEuler(new Euler(sunInstructionPitch, 0, 0))
              .add(new Vector3(...signalSunPosition));
            const projected = point.project(camera);
            expect(Math.abs(projected.x)).toBeLessThan(0.95);
            expect(Math.abs(projected.y)).toBeLessThan(0.95);
            expect(projected.z).toBeLessThan(1);
          }
      }
  }
});

it('arranges WASD and arrows as keyboards with their instructions to the left', () => {
  expect(sunInstructionScale(16 / 9)).toBe(1.2);
  expect(sunInstructionBlocks[0].y - sunInstructionBlocks[5].y).toBeGreaterThan(
    20,
  );
  const find = (text: string) =>
    sunInstructionBlocks.find((block) => block.text === text)!;
  for (const [up, left, down, right] of [
    ['w', 'a', 's', 'd'],
    ['↑', '←', '↓', '→'],
  ]) {
    expect(find(up).x).toBe(find(down).x);
    expect(find(up).y).toBeGreaterThan(find(down).y);
    expect(find(left).y).toBe(find(down).y);
    expect(find(right).y).toBe(find(down).y);
    expect(find(left).x).toBeLessThan(find(down).x);
    expect(find(right).x).toBeGreaterThan(find(down).x);
  }
  expect(
    sunInstructionBlocks[0].x + sunInstructionBlocks[0].width / 2,
  ).toBeLessThan(find('a').x - find('a').width / 2);
  expect(
    sunInstructionBlocks[5].x + sunInstructionBlocks[5].width / 2,
  ).toBeLessThan(find('←').x - find('←').width / 2);
});
