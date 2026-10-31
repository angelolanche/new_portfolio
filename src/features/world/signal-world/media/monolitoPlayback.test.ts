// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { configureMonolitoPlayback } from './monolitoPlayback';

function makeVideo() {
  const video = document.createElement('video');
  Object.defineProperties(video, {
    duration: { configurable: true, value: 20 },
    currentTime: { configurable: true, writable: true, value: 0 },
  });
  return video;
}

it('starts Monolito at the halfway texture and repeats from that point', () => {
  const video = makeVideo();
  const cleanup = configureMonolitoPlayback(video);

  video.dispatchEvent(new Event('loadedmetadata'));
  expect(video.currentTime).toBe(10);
  expect(video.loop).toBe(false);

  video.currentTime = 20;
  video.dispatchEvent(new Event('ended'));
  expect(video.currentTime).toBe(10);

  cleanup();
  video.currentTime = 0;
  video.dispatchEvent(new Event('loadedmetadata'));
  expect(video.currentTime).toBe(0);
});
it('waits for valid duration metadata before seeking', () => {
  const video = makeVideo();
  Object.defineProperty(video, 'duration', { configurable: true, value: NaN });
  configureMonolitoPlayback(video);

  video.dispatchEvent(new Event('loadedmetadata'));
  expect(video.currentTime).toBe(0);
});
