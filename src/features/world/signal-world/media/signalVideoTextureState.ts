/** Keep a loaded poster visible until decoding provides a video frame. */
export function bindSignalVideoTextureState(
  video: HTMLVideoElement,
  {
    showPoster,
    showVideo,
    releasePendingLoad,
  }: {
    showPoster: () => void;
    showVideo: () => void;
    releasePendingLoad: () => void;
  },
) {
  let posterHasLoaded = false;
  let videoFrameIsReady = false;
  const markPosterLoaded = () => {
    posterHasLoaded = true;
    if (!videoFrameIsReady) showPoster();
  };
  const handleVideoFrame = () => {
    videoFrameIsReady = true;
    showVideo();
  };
  const handleUnavailableVideo = () => {
    videoFrameIsReady = false;
    if (posterHasLoaded) showPoster();
    releasePendingLoad();
  };

  video.addEventListener('loadeddata', handleVideoFrame);
  video.addEventListener('error', handleUnavailableVideo);
  video.addEventListener('emptied', handleUnavailableVideo);
  return {
    markPosterLoaded,
    dispose() {
      video.removeEventListener('loadeddata', handleVideoFrame);
      video.removeEventListener('error', handleUnavailableVideo);
      video.removeEventListener('emptied', handleUnavailableVideo);
    },
  };
}
