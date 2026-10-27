import { openingDuration } from '../opening/timing';

export const exteriorVideo = '/media/exterior/black-hole.mp4';

/** One muted decoder, active only while the room can be seen. */
export function createExteriorPlayback(
  video: HTMLVideoElement,
  reducedMotion: boolean,
  onRelease: () => void = () => {},
) {
  let requested = false;
  let failed = false;
  let previousTime = 0;
  let disposed = false;
  let generation = 0;
  const release = () => {
    generation++;
    video.pause();
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.load();
    }
    requested = false;
    onRelease();
  };
  return {
    fail() {
      failed = true;
      release();
    },
    update(seconds: number, playing: boolean) {
      if (disposed) return;
      if (seconds < previousTime) {
        generation++;
        failed = false;
        requested = false;
      }
      previousTime = seconds;
      if (reducedMotion || seconds >= openingDuration) {
        if (video.hasAttribute('src')) release();
        return;
      }
      if (failed) return;
      if (!video.hasAttribute('src')) video.src = exteriorVideo;
      if (
        video.readyState >= 1 &&
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        const desired = Math.max(0, seconds) % video.duration;
        // Normal decoder drift must not trigger a seek on every animation frame.
        if (Math.abs(video.currentTime - desired) > (playing ? 0.25 : 0.03))
          video.currentTime = desired;
      }
      if (!playing) {
        if (!video.paused) video.pause();
        requested = false;
      } else if (video.readyState >= 2 && video.paused && !requested) {
        requested = true;
        const requestGeneration = generation;
        void video.play().catch(() => {
          if (disposed || requestGeneration !== generation) return;
          failed = true;
          requested = false;
          video.pause();
        });
      }
    },
    dispose() {
      disposed = true;
      release();
    },
  };
}
