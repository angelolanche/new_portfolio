// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import type OpeningCanvas from '../OpeningCanvas';
import { Opening } from '../../Opening';
import { openingDuration } from '../timing';

const canvasState = vi.hoisted(() => ({
  props: null as ComponentProps<typeof OpeningCanvas> | null,
}));
vi.mock('../scenePreload', () => ({
  prepareScene: () => Promise.resolve(),
  reportLoading: () => {},
  getLoadingProgress: () => 0,
  getLoadingStartedAt: () => Date.now(),
  minimumLoadingDuration: 800,
  subscribeLoading: () => () => {},
}));
vi.mock('../OpeningCanvas', () => ({
  default: (props: ComponentProps<typeof OpeningCanvas>) => {
    canvasState.props = props;
    return <div data-testid="canvas" />;
  },
}));

export const canvas = canvasState;

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

export async function setup() {
  render(<Opening />);
  await screen.findByTestId('canvas');
  return screen.getByRole('region', {
    name: 'Between Frames interactive portfolio',
  });
}

export async function enterTv() {
  await act(async () => {
    canvas.props!.elapsedRef.current = openingDuration;
    canvas.props!.onEntered();
  });
}
