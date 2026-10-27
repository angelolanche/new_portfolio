// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { createTitlePlayback } from './signalTitlePlayback';

function createVideo() {
  const video = document.createElement('video');
  Object.defineProperties(video, {
    duration: { value: 1.6 },
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

it('loops on the scene clock, suspends for dialogs and resumes', () => {
  const { video, play, pause } = createVideo();
  const playback = createTitlePlayback(video);
  playback.update(3.7, true);
  expect(video.currentTime).toBeCloseTo(0.5);
  expect(play).toHaveBeenCalledOnce();
  // Normal clock drift must not cause a costly seek on every render frame.
  video.currentTime = 0.52;
  playback.update(3.75, true);
  expect(video.currentTime).toBe(0.52);
  playback.update(3.75, false);
  expect(pause).toHaveBeenCalledOnce();
  expect(video.currentTime).toBeCloseTo(0.55);
  playback.update(3.75, false);
  expect(pause).toHaveBeenCalledOnce();
  playback.update(3.75, true);
  expect(play).toHaveBeenCalledTimes(2);
});

it('waits for decoded data and releases the decoder when disposed', () => {
  const { video, play, pause, load } = createVideo();
  video.src = '/media/aosol-title.mp4';
  Object.defineProperty(video, 'readyState', { value: 0, writable: true });
  const playback = createTitlePlayback(video);
  playback.update(0.5, true);
  expect(play).not.toHaveBeenCalled();
  expect(video.currentTime).toBe(0);
  Object.defineProperty(video, 'readyState', { value: 2, writable: true });
  playback.update(0.5, true);
  expect(play).toHaveBeenCalledOnce();
  playback.dispose();
  expect(pause).toHaveBeenCalledOnce();
  expect(video.hasAttribute('src')).toBe(false);
  expect(load).toHaveBeenCalledOnce();
});

it('does not retry rejected autoplay on every frame, and retries after pause/resume', async () => {
  const { video, play } = createVideo();
  play.mockRejectedValue(new Error('Autoplay unavailable'));
  const playback = createTitlePlayback(video);
  playback.update(0, true);
  await Promise.resolve();
  for (let frame = 0; frame < 60; frame++) playback.update(frame / 60, true);
  expect(play).toHaveBeenCalledOnce();
  playback.update(1, false);
  playback.update(1, true);
  expect(play).toHaveBeenCalledTimes(2);
  await Promise.resolve();
});
