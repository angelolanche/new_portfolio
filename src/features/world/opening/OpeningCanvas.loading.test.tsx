// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ComponentProps, ReactNode } from 'react';
import OpeningCanvas from './OpeningCanvas';
import { createFlight } from '../signal-world/navigation/signalNavigation';
import { trackSceneAsset } from './scenePreload';

const state = vi.hoisted(() => ({
  frames: [] as Array<() => void>,
  webgl: true,
  exteriorReady: null as (() => void) | null,
}));
vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    fallback,
  }: {
    children: ReactNode;
    fallback: ReactNode;
  }) => (state.webgl ? children : fallback),
  useFrame: (callback: () => void) => {
    state.frames.push(callback);
  },
}));
vi.mock('../room/Room', () => ({ Room: () => null }));
vi.mock('../surfaces/RoomSurfaces', () => ({
  RoomSurfaces: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../exterior/RealisticSpace', () => ({
  RealisticSpace: ({ onReady }: { onReady: () => void }) => {
    state.exteriorReady = onReady;
    return null;
  },
}));
vi.mock('../dither/ColorDither', () => ({ ColorDither: () => null }));
vi.mock('../signal-world/rendering/TelevisionStatic', () => ({
  TelevisionStatic: () => null,
}));
vi.mock('./CameraMove', () => ({
  CameraMove: ({ playing }: { playing: boolean }) => (
    <div data-testid="camera" data-playing={String(playing)} />
  ),
}));

beforeEach(() => {
  vi.useFakeTimers();
  state.frames = [];
  state.webgl = true;
  state.exteriorReady = null;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function setup() {
  const props: ComponentProps<typeof OpeningCanvas> = {
    playing: true,
    elapsedRef: { current: 0 },
    pointerRef: { current: { x: 0, y: 0 } },
    colorDither: false,
    navigationRef: {
      current: {
        progress: 0,
        target: 0,
        detailOpen: false,
        reducedMotion: false,
        flight: createFlight(),
      },
    },
    onEntered: () => {},
    onProject: () => {},
    suspended: false,
  };
  render(<OpeningCanvas {...props} />);
  return props;
}

it('keeps animation paused until rendered warm-up frames and visible 100% complete', () => {
  const props = setup();
  expect(screen.getByRole('progressbar')).toBeVisible();
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  const frame = state.frames[0];
  act(() => {
    for (let i = 0; i < 10; i++) frame();
  });
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  act(() => state.exteriorReady!());
  act(() => {
    frame();
    frame();
  });
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  act(() => frame());
  act(() => vi.advanceTimersByTime(2500));
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  act(() => vi.advanceTimersByTime(2500));
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(props.elapsedRef.current).toBe(0);
  act(() => vi.advanceTimersByTime(180));
  expect(screen.getByRole('progressbar').parentElement).toHaveClass(
    'is-leaving',
  );
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  act(() => vi.advanceTimersByTime(600));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'true');
});

it('removes the loading overlay when WebGL is unavailable so the HTML fallback remains accessible', () => {
  state.webgl = false;
  setup();
  act(() => vi.advanceTimersByTime(5780));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByText(/WebGL is unavailable/)).toBeVisible();
});

it('keeps loading beyond five seconds when the background is late', () => {
  setup();
  const frame = state.frames[0];
  act(() => {
    vi.advanceTimersByTime(6000);
    for (let i = 0; i < 10; i++) frame();
  });
  expect(screen.getByRole('progressbar')).toBeVisible();
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'false');
  act(() => {
    state.exteriorReady!();
    frame();
    frame();
    frame();
  });
  act(() => vi.advanceTimersByTime(780));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByTestId('camera')).toHaveAttribute('data-playing', 'true');
});

it('waits for every outstanding scene asset before beginning the reveal', () => {
  const done = trackSceneAsset();
  setup();
  const frame = state.frames[0];
  act(() => {
    state.exteriorReady!();
    for (let i = 0; i < 5; i++) frame();
    vi.advanceTimersByTime(6000);
  });
  expect(screen.getByRole('progressbar').parentElement).not.toHaveClass(
    'is-leaving',
  );
  act(() => {
    done();
    frame();
    frame();
    frame();
  });
  act(() => vi.advanceTimersByTime(780));
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
