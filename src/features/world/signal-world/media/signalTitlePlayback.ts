/** Keeps the reference loop on the scene clock without seeking on every frame. */
export function createTitlePlayback(video: HTMLVideoElement) {
  let playRequested = false;
  let failed = false;
  return {
    update(seconds: number, playing: boolean) {
      if (
        video.readyState >= 1 &&
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        const desiredTime = Math.max(0, seconds) % video.duration;
        if (
          Math.abs(video.currentTime - desiredTime) > (playing ? 0.12 : 0.025)
        )
          video.currentTime = desiredTime;
      }
      if (!playing) {
        if (!video.paused) video.pause();
        playRequested = false;
        failed = false;
      } else if (
        video.readyState >= 2 &&
        video.paused &&
        !playRequested &&
        !failed
      ) {
        playRequested = true;
        void video.play().catch(() => {
          failed = true;
        });
      }
    },
    dispose() {
      video.pause();
      video.removeAttribute('src');
      video.load();
    },
  };
}
