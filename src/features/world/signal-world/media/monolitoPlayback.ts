/** Start the Monolito signal texture on its brighter second half. */
export function configureMonolitoPlayback(video: HTMLVideoElement) {
  const seekToHalf = () => {
    if (Number.isFinite(video.duration) && video.duration > 0)
      video.currentTime = video.duration / 2;
  };
  const startAtHalf = () => {
    if (video.currentTime < video.duration / 2) seekToHalf();
  };
  video.loop = false;
  video.addEventListener('loadedmetadata', startAtHalf);
  video.addEventListener('ended', seekToHalf);
  return () => {
    video.removeEventListener('loadedmetadata', startAtHalf);
    video.removeEventListener('ended', seekToHalf);
  };
}
