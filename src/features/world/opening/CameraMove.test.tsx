// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { PerspectiveCamera, Vector3 } from 'three';
import { projects } from '../../../content/projects';
import { expect, it, vi } from 'vitest';
import { CameraMove } from './CameraMove';
import { openingDuration, sampleOpening } from './cameraPath';
import { createFlight } from '../signal-world/navigation/signalNavigation';
import type { SignalNavigation } from '../signal-world/navigation/signalNavigation';

it.each(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'])(
  'caps mouse inspection at 45 degrees for %s and recenters on the next journey',
  (key) => {
    const elapsedRef = { current: openingDuration + 5 };
    const pointerRef = { current: { x: 0, y: 0 } };
    const navigationRef = {
      current: {
        progress: projects[0].progress,
        target: projects[0].progress,
        detailOpen: false,
        reducedMotion: false,
        lookKeys: { [key]: true },
      } as SignalNavigation,
    };
    const camera = new PerspectiveCamera();
    render(
      <CameraMove
        elapsedRef={elapsedRef}
        pointerRef={pointerRef}
        navigationRef={navigationRef}
        playing={false}
      />,
    );
    pointerRef.current = {
      x: key === 'ArrowRight' ? 20 : key === 'ArrowLeft' ? -20 : 0,
      y: key === 'ArrowDown' ? 20 : key === 'ArrowUp' ? -20 : 0,
    };
    for (let i = 0; i < 600; i++) frame.callback({ camera }, 1 / 60);
    expect(
      Math.max(Math.abs(pointerRef.current.x), Math.abs(pointerRef.current.y)),
    ).toBe(1);
    expect(
      camera.getWorldDirection(new Vector3()).dot(new Vector3(0, 0, -1)),
    ).toBeCloseTo(Math.SQRT1_2, 6);
    navigationRef.current.lookKeys = {};
    navigationRef.current.target = projects[1].progress;
    frame.callback({ camera }, 1 / 60);
    expect(pointerRef.current).toEqual({ x: 0, y: 0 });
    expect(
      camera.getWorldDirection(new Vector3()).dot(new Vector3(0, 0, -1)),
    ).toBeCloseTo(1, 6);
  },
);

it('turns continuously with held arrow keys, releases on keyup and suppresses look during guided travel', () => {
  const elapsedRef = { current: openingDuration + 5 };
  const pointerRef = { current: { x: 0, y: 0 } };
  const navigationRef = {
    current: {
      progress: 0,
      target: 0,
      detailOpen: false,
      reducedMotion: false,
      flight: { ...createFlight(), position: { x: 1, y: 0, z: 0 } },
      lookKeys: { ArrowRight: true, ArrowUp: true },
    } as SignalNavigation,
  };
  const camera = new PerspectiveCamera();
  render(
    <CameraMove
      elapsedRef={elapsedRef}
      pointerRef={pointerRef}
      navigationRef={navigationRef}
      playing={false}
    />,
  );
  for (let i = 0; i < 60; i++) frame.callback({ camera }, 1 / 60);
  expect(pointerRef.current.x).toBeCloseTo(0.45 * 0.85);
  expect(pointerRef.current.y).toBeCloseTo(-0.6 * 0.85);
  navigationRef.current.lookKeys = {};
  const stopped = { ...pointerRef.current };
  for (let i = 0; i < 60; i++) frame.callback({ camera }, 1 / 60);
  expect(pointerRef.current).toEqual(stopped);
  navigationRef.current.target = 0.08;
  frame.callback({ camera }, 1 / 60);
  expect(pointerRef.current).toEqual({ x: 0, y: 0 });
});

const frame = vi.hoisted(() => ({
  callback:
    vi.fn<(state: { camera: PerspectiveCamera }, delta: number) => void>(),
}));

it('holds movement during GPU warmup and discards its slow frame before starting the clock', () => {
  const elapsedRef = { current: 0 };
  const openingReadyRef = { current: false };
  const camera = new PerspectiveCamera();
  render(
    <CameraMove
      elapsedRef={elapsedRef}
      pointerRef={{ current: { x: 0, y: 0 } }}
      openingReadyRef={openingReadyRef}
      playing
    />,
  );
  frame.callback({ camera }, 0.8);
  frame.callback({ camera }, 0.4);
  expect(elapsedRef.current).toBe(0);
  openingReadyRef.current = true;
  frame.callback({ camera }, 0.3);
  expect(elapsedRef.current).toBe(0);
  frame.callback({ camera }, 1 / 60);
  expect(elapsedRef.current).toBeCloseTo(1 / 60);
  expect(
    camera.position.distanceTo(sampleOpening(1 / 60, 16 / 9).position),
  ).toBeLessThan(1e-10);
});
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: typeof frame.callback) => {
    frame.callback = callback;
  },
  useThree: (
    selector: (state: { size: { width: number; height: number } }) => unknown,
  ) => selector({ size: { width: 1600, height: 900 } }),
}));

it('preserves pointer look and dialog suspension after TV entry', () => {
  const elapsedRef = { current: openingDuration + 6 };
  const pointerRef = { current: { x: 1, y: 0.5 } };
  const camera = new PerspectiveCamera();
  const props = { elapsedRef, pointerRef, playing: false };
  const view = render(<CameraMove {...props} />);
  frame.callback({ camera }, 1 / 60);
  const finalPose = sampleOpening(openingDuration, 16 / 9);
  expect(camera.position.distanceTo(finalPose.position)).toBeLessThan(1e-10);
  const orientation = camera.quaternion.clone();
  frame.callback({ camera }, 1 / 60);
  expect(elapsedRef.current).toBe(openingDuration + 6);
  expect(camera.quaternion.angleTo(orientation)).toBeGreaterThan(0);

  view.rerender(<CameraMove {...props} suspended />);
  const suspendedPosition = camera.position.clone();
  const suspendedOrientation = camera.quaternion.clone();
  pointerRef.current = { x: -1, y: -1 };
  frame.callback({ camera }, 1 / 60);
  expect(camera.position).toEqual(suspendedPosition);
  expect(camera.quaternion.toArray()).toEqual(suspendedOrientation.toArray());
});

it('enters the TV centered without converting the room pointer position into a free turn', () => {
  const elapsedRef = { current: openingDuration - 0.1 };
  const pointerRef = { current: { x: 0.8, y: -0.6 } };
  const camera = new PerspectiveCamera();
  render(
    <CameraMove
      elapsedRef={elapsedRef}
      pointerRef={pointerRef}
      playing={false}
    />,
  );
  frame.callback({ camera }, 1 / 60);
  elapsedRef.current = openingDuration;
  frame.callback({ camera }, 1 / 60);
  expect(pointerRef.current).toEqual({ x: 0, y: 0 });
  elapsedRef.current = openingDuration + 6;
  frame.callback({ camera }, 1 / 60);
  const neutral = camera.quaternion.clone();
  pointerRef.current = { x: 2.5, y: 0 };
  for (let i = 0; i < 180; i++) frame.callback({ camera }, 1 / 60);
  expect(camera.quaternion.angleTo(neutral)).toBeGreaterThan(1.5);
  expect(pointerRef.current.x).toBe(2.5);
});

it.each([0, ...projects.map((project) => project.progress), 1])(
  'keeps inspection bounded at stop %s, preserves yaw on departure and completes multiple free turns',
  (progress) => {
    const elapsedRef = { current: openingDuration + 5 };
    const pointerRef = { current: { x: 0.8, y: 0 } };
    const navigationRef = {
      current: {
        progress,
        target: progress,
        detailOpen: false,
        reducedMotion: false,
        flight: createFlight(),
        lookKeys: {},
      } as SignalNavigation,
    };
    const camera = new PerspectiveCamera();
    render(
      <CameraMove
        elapsedRef={elapsedRef}
        pointerRef={pointerRef}
        navigationRef={navigationRef}
        playing={false}
      />,
    );
    for (let i = 0; i < 180; i++) frame.callback({ camera }, 1 / 60);
    const inspectedOrientation = camera.quaternion.clone();
    navigationRef.current.flight!.movement.forward = 1;
    frame.callback({ camera }, 1 / 60);
    expect(camera.quaternion.angleTo(inspectedOrientation)).toBeLessThan(1e-6);
    navigationRef.current.lookKeys = { ArrowRight: true };
    const directions: Vector3[] = [];
    for (let i = 0; i < 720; i++) {
      frame.callback({ camera }, 1 / 60);
      directions.push(camera.getWorldDirection(new Vector3()));
    }
    expect(pointerRef.current.x).toBeGreaterThan(4);
    let totalRotation = 0;
    for (let i = 1; i < directions.length; i++)
      totalRotation += directions[i].angleTo(directions[i - 1]);
    expect(totalRotation).toBeGreaterThan(Math.PI * 4);
  },
);
