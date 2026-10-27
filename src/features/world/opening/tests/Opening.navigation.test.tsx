// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { projects } from '../../../../content/projects';
import {
  advanceSignal,
  signalTravelDuration,
} from '../../signal-world/navigation/signalNavigation';

import { canvas, setup, enterTv } from './openingHarness';

describe('Opening navigation', () => {
  it('responds to a tiny vertical wheel over overlays and ignores horizontal or shift-wheel gestures', async () => {
    const scene = await setup();
    await enterTv();
    const navigation = canvas.props!.navigationRef.current;
    fireEvent.wheel(scene, { deltaX: 20, deltaY: 0.2 });
    fireEvent.wheel(scene, { deltaX: 0, deltaY: 10, shiftKey: true });
    expect(navigation.target).toBe(0);
    fireEvent.wheel(screen.getByRole('button', { name: 'Work index +' }), {
      deltaY: 0.05,
    });
    expect(navigation.target).toBe(projects[0].progress);
  });

  it('accepts the first subtle wheel on arrival even after a recent event in flight', async () => {
    await setup();
    await enterTv();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    try {
      const navigation = canvas.props!.navigationRef.current;
      fireEvent.wheel(window, { deltaY: 0.1 });
      for (let i = 0; i < 165; i++) advanceSignal(navigation, 1 / 60);
      clock.mockReturnValue(2750);
      fireEvent.wheel(window, { deltaY: 0.01 });
      for (let i = 0; i < 5; i++) advanceSignal(navigation, 1 / 60);
      expect(navigation.progress).toBe(projects[0].progress);
      clock.mockReturnValue(2833);
      fireEvent.wheel(window, { deltaY: 0.05 });
      expect(navigation.target).toBe(projects[1].progress);
    } finally {
      clock.mockRestore();
    }
  });

  it('allows the next wheel journey and free controls immediately after arrival, without moving the mouse', async () => {
    const scene = await setup();
    await enterTv();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    try {
      const navigation = canvas.props!.navigationRef.current;
      fireEvent.wheel(scene, { deltaY: 100 });
      for (
        let frame = 0;
        frame < Math.ceil(signalTravelDuration * 60) + 1;
        frame++
      )
        advanceSignal(navigation, 1 / 60);
      expect(navigation.progress).toBe(projects[0].progress);
      fireEvent.keyDown(scene, { key: 'w' });
      expect(navigation.flight!.movement.forward).toBe(1);
      fireEvent.keyDown(scene, { key: 'ArrowRight' });
      expect(navigation.lookKeys?.ArrowRight).toBe(true);
      clock.mockReturnValue(3000);
      fireEvent.wheel(scene, { deltaY: 100 });
      expect(navigation.target).toBe(projects[1].progress);
      expect(navigation.flight!.movement.forward).toBe(0);
      expect(navigation.lookKeys).toEqual({});
    } finally {
      clock.mockRestore();
    }
  });

  it('completes one work per wheel gesture and ignores inertia during travel', async () => {
    const scene = await setup();
    await enterTv();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    try {
      const navigation = canvas.props!.navigationRef.current;
      canvas.props!.pointerRef.current = { x: 1, y: 0.5 };
      fireEvent.wheel(scene, { deltaY: 1 });
      expect(navigation.target).toBe(projects[0].progress);
      expect(canvas.props!.pointerRef.current).toEqual({ x: 0, y: 0 });
      clock.mockReturnValue(400);
      fireEvent.wheel(scene, { deltaY: 900 });
      expect(navigation.target).toBe(projects[0].progress);
      navigation.progress = navigation.target;
      clock.mockReturnValue(450);
      fireEvent.wheel(scene, { deltaY: 2 });
      expect(navigation.target).toBe(projects[0].progress);
      clock.mockReturnValue(800);
      fireEvent.wheel(scene, { deltaY: 10000 });
      expect(navigation.target).toBe(projects[1].progress);
      fireEvent.keyDown(scene, { key: 'w' });
      expect(navigation.flight!.movement.forward).toBe(0);
      fireEvent.pointerMove(scene, { clientX: 300, clientY: 200 });
      expect(canvas.props!.pointerRef.current).toEqual({ x: 0, y: 0 });
      navigation.progress = navigation.target;
      clock.mockReturnValue(1200);
      fireEvent.wheel(scene, { deltaY: -1 });
      expect(navigation.target).toBe(projects[0].progress);
    } finally {
      clock.mockRestore();
    }
  });
});
