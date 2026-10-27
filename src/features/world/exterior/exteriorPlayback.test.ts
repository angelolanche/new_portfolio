// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { createExteriorPlayback, exteriorVideo } from './exteriorPlayback';
import { openingDuration } from '../opening/timing';

function createVideo() {
  const video = document.createElement('video');
  Object.defineProperties(video, {
    duration: { value: 15 },
    readyState: { value: 2, writable: true },
    paused: { value: true, writable: true },
  });
  const play = vi.spyOn(video, 'play').mockImplementation(async () => {
    Object.defineProperty(video, 'paused', { value: false, writable: true });
  });
  const pause = vi.spyOn(video, 'pause').mockImplementation(() => {
    Object.defineProperty(video, 'paused', { value: true, writable: true });
  });
  const load = vi.spyOn(video, 'load').mockImplementation(() => {});
  return { video, play, pause, load };
}

it('synchronizes the room video, freezes during Pause/dialogs and restarts on Replay', () => {
  const { video, play, pause } = createVideo();
  const playback = createExteriorPlayback(video, false);
  playback.update(3, true);
  expect(video.getAttribute('src')).toBe(exteriorVideo);
  expect(video.currentTime).toBe(3);
  expect(play).toHaveBeenCalledOnce();
  video.currentTime = 3.02;
  playback.update(3.05, true);
  expect(video.currentTime).toBe(3.02);
  playback.update(3.1, false);
  expect(video.currentTime).toBeCloseTo(3.1);
  expect(pause).toHaveBeenCalledOnce();
  playback.update(3.1, true);
  expect(play).toHaveBeenCalledTimes(2);
  playback.update(0, true);
  expect(video.currentTime).toBe(0);
});

it('releases the decoder at TV entry, reloads on Replay and cleans up on unmount', () => {
  const { video, play, load } = createVideo();
  const playback = createExteriorPlayback(video, false);
  playback.update(0, true);
  playback.update(openingDuration, true);
  expect(video.hasAttribute('src')).toBe(false);
  expect(video.paused).toBe(true);
  expect(load).toHaveBeenCalledOnce();
  for (let frame = 0; frame < 60; frame++)
    playback.update(openingDuration, true);
  expect(load).toHaveBeenCalledOnce();
  playback.update(0, true);
  expect(video.getAttribute('src')).toBe(exteriorVideo);
  expect(play).toHaveBeenCalledTimes(2);
  playback.dispose();
  expect(video.hasAttribute('src')).toBe(false);
  expect(load).toHaveBeenCalledTimes(2);
  playback.update(0, true);
  expect(video.hasAttribute('src')).toBe(false);
});

it('uses only the poster for reduced motion and waits for decoded data before playing', () => {
  const { video, play } = createVideo();
  createExteriorPlayback(video, true).update(0, true);
  expect(video.hasAttribute('src')).toBe(false);
  expect(play).not.toHaveBeenCalled();
  Object.defineProperty(video, 'readyState', { value: 0, writable: true });
  const playback = createExteriorPlayback(video, false);
  playback.update(1, true);
  expect(play).not.toHaveBeenCalled();
  expect(video.currentTime).toBe(0);
  Object.defineProperty(video, 'readyState', { value: 2 });
  playback.update(1, true);
  expect(play).toHaveBeenCalledOnce();
});

it('does not retry failed network/decoder requests every frame, but allows Replay', () => {
  const { video, load } = createVideo();
  const playback = createExteriorPlayback(video, false);
  playback.update(1, true);
  playback.fail();
  for (let frame = 0; frame < 60; frame++)
    playback.update(1 + frame / 60, true);
  expect(video.hasAttribute('src')).toBe(false);
  expect(load).toHaveBeenCalledOnce();
  playback.update(0, true);
  expect(video.getAttribute('src')).toBe(exteriorVideo);
});

it('does not retry rejected autoplay every frame', async () => {
  const { video, play } = createVideo();
  play.mockRejectedValue(new Error('Autoplay unavailable'));
  const playback = createExteriorPlayback(video, false);
  playback.update(1, true);
  await Promise.resolve();
  for (let frame = 0; frame < 60; frame++)
    playback.update(1 + frame / 60, true);
  expect(play).toHaveBeenCalledOnce();
});
