// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { PerspectiveCamera } from 'three';
import { expect, it, vi } from 'vitest';
import { CameraMove } from './CameraMove';
import { openingDuration, sampleOpening } from '../cameraPath';

const frame = vi.hoisted(() => ({
  callback:
    vi.fn<(state: { camera: PerspectiveCamera }, delta: number) => void>(),
}));
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: typeof frame.callback) => {
    frame.callback = callback;
  },
  useThree: (
    selector: (state: { size: { width: number; height: number } }) => unknown,
  ) => selector({ size: { width: 1600, height: 900 } }),
}));

it('preserves paused pointer look and restores the opening pose on replay after TV entry', () => {
  const elapsedRef = { current: openingDuration + 6 };
  const pointerRef = { current: { x: 1, y: 0.5 } };
  const camera = new PerspectiveCamera();
  const props = { elapsedRef, pointerRef, reset: 0, playing: false };
  const view = render(<CameraMove {...props} />);
  frame.callback({ camera }, 1 / 60);
  const finalPose = sampleOpening(openingDuration, 16 / 9);
  expect(camera.position.distanceTo(finalPose.position)).toBeLessThan(1e-10);
  const orientation = camera.quaternion.clone();
  frame.callback({ camera }, 1 / 60);
  expect(elapsedRef.current).toBe(openingDuration + 6);
  expect(camera.quaternion.angleTo(orientation)).toBeGreaterThan(0);

  view.rerender(<CameraMove {...props} reset={1} />);
  frame.callback({ camera }, 1 / 60);
  expect(elapsedRef.current).toBe(0);
  expect(pointerRef.current).toEqual({ x: 0, y: 0 });
  expect(
    camera.position.distanceTo(sampleOpening(0, 16 / 9).position),
  ).toBeLessThan(1e-10);
});
