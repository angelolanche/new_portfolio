// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { projects } from '../../../../content/projects';

import { canvas, setup, enterTv } from './openingHarness';

describe('Opening touch', () => {
  it('looks while a phone drag is held in the room and signal, then recenters on release', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('pointer: coarse'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    window.PointerEvent = class extends MouseEvent {
      pointerType: string;
      pointerId: number;
      constructor(type: string, init: PointerEventInit) {
        super(type, init);
        this.pointerType = init.pointerType ?? '';
        this.pointerId = init.pointerId ?? 0;
      }
    } as typeof PointerEvent;
    try {
      const scene = await setup();
      const drag = (id: number) => {
        fireEvent.pointerDown(scene, {
          pointerType: 'touch',
          pointerId: id,
          clientX: 100,
          clientY: 200,
        });
        fireEvent.pointerMove(scene, {
          pointerType: 'touch',
          pointerId: id,
          clientX: 180,
          clientY: 140,
        });
        expect(canvas.props?.pointerRef.current.x).toBeGreaterThan(0);
        expect(canvas.props?.pointerRef.current.y).toBeLessThan(0);
        fireEvent.pointerUp(scene, { pointerType: 'touch', pointerId: id });
        expect(canvas.props?.pointerRef.current).toEqual({ x: 0, y: 0 });
      };
      drag(1);
      await enterTv();
      canvas.props!.navigationRef.current.progress = projects[0].progress;
      canvas.props!.navigationRef.current.target = projects[0].progress;
      drag(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('shows touch navigation buttons and moves one work in either direction', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('pointer: coarse'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    await setup();
    await enterTv();
    fireEvent.click(screen.getByRole('button', { name: 'Next work' }));
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(
      projects[0].progress,
    );
    canvas.props!.navigationRef.current.progress = projects[0].progress;
    fireEvent.click(screen.getByRole('button', { name: 'Previous work' }));
    expect(canvas.props?.navigationRef.current.target).toBe(0);
    vi.unstubAllGlobals();
  });

  it('uses vertical touch swipes for travel and horizontal swipes for persistent look', async () => {
    // jsdom has no PointerEvent implementation; preserve the actual pointer fields.
    window.PointerEvent = class extends MouseEvent {
      pointerType: string;
      pointerId: number;
      constructor(type: string, init: PointerEventInit) {
        super(type, init);
        this.pointerType = init.pointerType ?? '';
        this.pointerId = init.pointerId ?? 0;
      }
    } as typeof PointerEvent;
    const scene = await setup();
    await enterTv();
    fireEvent.pointerDown(scene, {
      pointerType: 'touch',
      pointerId: 1,
      clientY: 400,
    });
    fireEvent.pointerMove(scene, {
      pointerType: 'touch',
      pointerId: 1,
      clientY: 180,
    });
    fireEvent.pointerUp(scene, {
      pointerType: 'touch',
      pointerId: 1,
      clientY: 180,
    });
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(
      projects[0].progress,
    );
    expect(canvas.props?.pointerRef.current).toEqual({ x: 0, y: 0 });
    canvas.props!.navigationRef.current.progress = projects[0].progress;
    fireEvent.pointerDown(scene, {
      pointerType: 'touch',
      pointerId: 2,
      clientX: 100,
      clientY: 180,
    });
    fireEvent.pointerMove(scene, {
      pointerType: 'touch',
      pointerId: 2,
      clientX: 200,
      clientY: 180,
    });
    fireEvent.pointerUp(scene, {
      pointerType: 'touch',
      pointerId: 2,
      clientX: 200,
      clientY: 180,
    });
    fireEvent.pointerLeave(scene, { pointerType: 'touch', pointerId: 2 });
    expect(canvas.props?.pointerRef.current.x).toBeCloseTo(-0.353121875);
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(
      projects[0].progress,
    );

    fireEvent.pointerDown(scene, {
      pointerType: 'touch',
      pointerId: 3,
      clientX: 200,
      clientY: 180,
    });
    fireEvent.pointerDown(scene, {
      pointerType: 'touch',
      pointerId: 4,
      clientX: 220,
      clientY: 180,
    });
    fireEvent.pointerMove(scene, {
      pointerType: 'touch',
      pointerId: 3,
      clientX: 200,
      clientY: 80,
    });
    fireEvent.pointerUp(scene, { pointerType: 'touch', pointerId: 3 });
    expect(canvas.props?.pointerRef.current.y).toBeCloseTo(0.1177072917);
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(
      projects[0].progress,
    );
  });
});
