// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const media: Array<HTMLVideoElement | HTMLImageElement> = [];
beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  media.length = 0;
  vi.spyOn(HTMLMediaElement.prototype, 'src', 'set').mockImplementation(
    function (this: HTMLVideoElement) {
      media.push(this);
    },
  );
  vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(
    function (this: HTMLImageElement) {
      media.push(this);
    },
  );
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('starts at zero, counts real readiness events, deduplicates and reuses warmed decoders', async () => {
  const preload = await import('./scenePreload');
  const listener = vi.fn();
  const unsubscribe = preload.subscribeLoading(listener);
  const pending = preload.prepareScene();
  expect(preload.prepareScene()).toBe(pending);
  expect(preload.getLoadingProgress()).toBe(0);
  expect(media).toHaveLength(4);
  media.forEach((item) =>
    item.dispatchEvent(
      new Event(item instanceof HTMLVideoElement ? 'loadeddata' : 'load'),
    ),
  );
  await pending;
  expect(preload.getLoadingProgress()).toBe(70);
  expect(listener).toHaveBeenCalledTimes(4);
  expect(preload.takePreparedVideo('/media/exterior/black-hole.mp4')).toBe(
    media[2],
  );
  expect(preload.takePreparedVideo('/media/exterior/black-hole.mp4')).not.toBe(
    media[2],
  );
  unsubscribe();
  preload.reportLoading(100);
  preload.reportLoading(50);
  expect(preload.getLoadingProgress()).toBe(100);
  expect(listener).toHaveBeenCalledTimes(4);
});

it('continues after media errors and slow connections without waiting forever', async () => {
  const preload = await import('./scenePreload');
  const pending = preload.prepareScene();
  media[0].dispatchEvent(new Event('error'));
  expect(preload.getLoadingProgress()).toBe(17.5);
  await vi.advanceTimersByTimeAsync(10000);
  await pending;
  expect(preload.getLoadingProgress()).toBe(70);
  media[1].dispatchEvent(new Event('load'));
  expect(preload.getLoadingProgress()).toBe(70);
});

it('does not request videos for reduced motion', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const preload = await import('./scenePreload');
  const pending = preload.prepareScene();
  expect(media).toHaveLength(2);
  expect(media.every((item) => item instanceof HTMLImageElement)).toBe(true);
  media.forEach((item) => item.dispatchEvent(new Event('load')));
  await pending;
});

it('replaces the initial HTML loader and exposes live accessible progress', async () => {
  const preload = await import('./scenePreload');
  const { LoadingScreen } = await import('./LoadingScreen');
  const boot = document.createElement('div');
  boot.id = 'boot-loader';
  document.body.append(boot);
  render(<LoadingScreen />);
  expect(document.getElementById('boot-loader')).toBeNull();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  act(() => preload.reportLoading(85));
  expect(screen.getByText('85%')).toBeVisible();
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('85%')).toBeVisible();
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '85',
  );
  act(() => preload.reportLoading(100));
  expect(screen.getByText('100%')).toBeVisible();
});

it('tracks outstanding scene assets and resolves each only once', async () => {
  const preload = await import('./scenePreload');
  const posterDone = preload.trackSceneAsset();
  const videoDone = preload.trackSceneAsset();
  expect(preload.areSceneAssetsReady()).toBe(false);
  posterDone();
  posterDone();
  expect(preload.areSceneAssetsReady()).toBe(false);
  expect(preload.getLoadingProgress()).toBe(90);
  videoDone();
  expect(preload.areSceneAssetsReady()).toBe(true);
  expect(preload.getLoadingProgress()).toBe(95);
});
