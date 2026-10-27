// @vitest-environment jsdom
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { signalEntryEnd } from '../timing';
import { projects } from '../../../../content/projects';

import { canvas, setup, enterTv } from './openingHarness';

describe('Opening playback', () => {
  it('keeps only Work index and About on the canvas, before and after TV entry', async () => {
    await setup();
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Work index +', 'About']);
    await enterTv();
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Work index +', 'About']);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Follow the red thread.'),
    ).not.toBeInTheDocument();
  });

  it('starts reduced-motion visitors inside the signal without needing a removed Play button', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    try {
      const scene = await setup();
      expect(canvas.props?.elapsedRef.current).toBe(signalEntryEnd);
      expect(canvas.props?.playing).toBe(false);
      fireEvent.keyDown(scene, { key: 'End' });
      expect(canvas.props?.navigationRef.current.target).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('gates wheel travel behind the entry and resets navigation on Replay', async () => {
    const scene = await setup();
    fireEvent.wheel(scene, { deltaY: 650 });
    expect(canvas.props?.navigationRef.current.target).toBe(0);
    await enterTv();
    fireEvent.wheel(scene, { deltaY: 650 });
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(
      projects[0].progress,
    );
    fireEvent.keyDown(scene, { key: 'r' });
    expect(canvas.props?.navigationRef.current.target).toBe(0);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('keeps free flight, pause and restart on the keyboard without visible controls', async () => {
    const scene = await setup();
    await enterTv();
    fireEvent.keyDown(scene, { key: 'w' });
    expect(canvas.props?.navigationRef.current.flight?.movement.forward).toBe(
      1,
    );
    fireEvent.keyUp(scene, { key: 'w' });
    expect(canvas.props?.navigationRef.current.flight?.movement.forward).toBe(
      0,
    );
    fireEvent.keyDown(scene, { key: 'e' });
    expect(canvas.props?.navigationRef.current.flight?.movement.up).toBe(1);
    fireEvent.keyUp(scene, { key: 'e' });
    expect(canvas.props?.navigationRef.current.flight?.movement.up).toBe(0);
    fireEvent.keyDown(scene, { key: ' ', code: 'Space' });
    expect(canvas.props?.playing).toBe(false);
    fireEvent.keyDown(scene, { key: ' ', code: 'Space' });
    expect(canvas.props?.playing).toBe(true);
    fireEvent.keyDown(scene, { key: 'd' });
    fireEvent.blur(scene);
    expect(canvas.props?.navigationRef.current.flight?.movement.right).toBe(0);
    act(() => {
      canvas.props!.navigationRef.current.flight!.position.x = 5;
      canvas.props!.navigationRef.current.flight!.target.x = 5;
    });
    fireEvent.keyDown(scene, { key: 'r' });
    expect(canvas.props?.navigationRef.current.flight?.position.x).toBe(0);
    expect(canvas.props?.navigationRef.current.flight?.target.x).toBe(0);
  });
});
