// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { projects } from '../../../../content/projects';
import { advanceSignal } from '../../signal-world/navigation/signalNavigation';

import { canvas, setup, enterTv } from './openingHarness';

describe('Opening look', () => {
  it('keeps free mode after key release and blur until the next scroll, ignoring the removed restart key', async () => {
    const scene = await setup();
    await enterTv();
    const navigation = canvas.props!.navigationRef.current;
    fireEvent.keyDown(scene, { key: 'w' });
    expect(navigation.mode).toBe('free');
    fireEvent.keyUp(scene, { key: 'w' });
    fireEvent.blur(scene);
    expect(navigation.flight?.movement.forward).toBe(0);
    expect(navigation.mode).toBe('free');
    fireEvent.wheel(scene, { deltaY: 1 });
    expect(navigation.mode).toBe('scroll');
    navigation.progress = navigation.target;
    fireEvent.keyDown(scene, { key: 'd' });
    expect(navigation.mode).toBe('free');
    fireEvent.keyDown(scene, { key: 'r' });
    expect(navigation.mode).toBe('free');
  });

  it.each([0, 1])(
    'uses the work mouse controls at title/sun stop %s',
    async (progress) => {
      const scene = await setup();
      await enterTv();
      const navigation = canvas.props!.navigationRef.current;
      navigation.progress = navigation.target = progress;
      vi.spyOn(scene, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 400,
        bottom: 300,
        width: 400,
        height: 300,
        toJSON: () => ({}),
      });
      const pointer = (clientX: number, clientY: number) =>
        fireEvent(
          scene,
          Object.assign(new Event('pointermove', { bubbles: true }), {
            pointerType: 'mouse',
            clientX,
            clientY,
          }),
        );
      pointer(0, 0);
      pointer(100, 50);
      expect(canvas.props!.pointerRef.current.x).toBeCloseTo(0.353121875);
      expect(canvas.props!.pointerRef.current.y).toBeCloseTo(0.2354145833);
      pointer(10000, 10000);
      expect(canvas.props!.pointerRef.current).toEqual({ x: 1, y: 1 });
      fireEvent.keyDown(scene, { key: 'ArrowRight' });
      expect(navigation.lookKeys?.ArrowRight).not.toBe(true);
      fireEvent.keyDown(scene, { key: 'w' });
      fireEvent.keyDown(scene, { key: 'ArrowRight' });
      expect(navigation.lookKeys?.ArrowRight).toBe(true);
    },
  );

  it('uses bounded mouse look at a work, recenters on scroll, and keeps free flight on arrows', async () => {
    const scene = await setup();
    await enterTv();
    vi.spyOn(scene, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => ({}),
    });
    const navigation = canvas.props!.navigationRef.current;
    navigation.progress = navigation.target = projects[0].progress;
    const pointer = (x: number, y: number) =>
      fireEvent(
        scene,
        Object.assign(new Event('pointermove', { bubbles: true }), {
          pointerType: 'mouse',
          clientX: x,
          clientY: y,
        }),
      );
    pointer(100, 100);
    pointer(200, 150);
    expect(canvas.props!.pointerRef.current.x).toBeCloseTo(0.353121875);
    expect(canvas.props!.pointerRef.current.y).toBeCloseTo(0.2354145833);
    fireEvent.keyDown(scene, { key: 'ArrowRight' });
    expect(navigation.lookKeys?.ArrowRight).not.toBe(true);
    pointer(10000, 10000);
    expect(canvas.props!.pointerRef.current).toEqual({ x: 1, y: 1 });
    fireEvent.wheel(scene, { deltaY: 0.1 });
    expect(canvas.props!.pointerRef.current).toEqual({ x: 0, y: 0 });
    expect(navigation.target).toBe(projects[1].progress);
    pointer(200, 150);
    expect(canvas.props!.pointerRef.current).toEqual({ x: 0, y: 0 });
    for (let i = 0; i < 170; i++) advanceSignal(navigation, 1 / 60);
    fireEvent.keyDown(scene, { key: 'w' });
    pointer(300, 250);
    pointer(400, 300);
    expect(canvas.props!.pointerRef.current).toEqual({ x: 0, y: 0 });
    fireEvent.keyDown(scene, { key: 'ArrowRight' });
    expect(navigation.lookKeys?.ArrowRight).toBe(true);
  });

  it('uses arrows for free look and ignores mouse movement inside the TV', async () => {
    const scene = await setup();
    vi.spyOn(scene, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => ({}),
    });
    await enterTv();
    const pointer = (x: number, y: number) =>
      fireEvent(
        scene,
        Object.assign(new Event('pointermove', { bubbles: true }), {
          pointerType: 'mouse',
          clientX: x,
          clientY: y,
        }),
      );
    fireEvent.keyDown(scene, { key: 'w' });
    pointer(100, 100);
    pointer(400, 100);
    expect(canvas.props?.pointerRef.current.x).toBe(0);
    fireEvent(
      scene,
      Object.assign(new Event('pointerout', { bubbles: true }), {
        pointerType: 'mouse',
        relatedTarget: null,
      }),
    );
    expect(canvas.props?.pointerRef.current.x).toBe(0);
    pointer(100, 100);
    pointer(400, 100);
    pointer(400, 300);
    expect(canvas.props?.pointerRef.current).toEqual({ x: 0, y: 0 });
    fireEvent.keyDown(scene, { key: 'ArrowRight' });
    expect(canvas.props?.navigationRef.current.lookKeys?.ArrowRight).toBe(true);
    fireEvent.keyUp(scene, { key: 'ArrowRight' });
    expect(canvas.props?.navigationRef.current.lookKeys?.ArrowRight).toBe(
      false,
    );
    fireEvent.keyDown(scene, { key: 'ArrowUp' });
    fireEvent.blur(scene);
    expect(canvas.props?.navigationRef.current.lookKeys).toEqual({});
    expect(canvas.props?.navigationRef.current.target).toBe(0);
  });
});
