// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { bindSignalVideoTextureState } from './signalVideoTextureState';

it('shows a late poster while the first video frame is still decoding', () => {
  const video = document.createElement('video');
  const showPoster = vi.fn();
  const showVideo = vi.fn();
  const state = bindSignalVideoTextureState(video, {
    showPoster,
    showVideo,
    releasePendingLoad: vi.fn(),
  });

  video.src = '/media/projects/camera-roll.mp4';
  state.markPosterLoaded();

  expect(showPoster).toHaveBeenCalledOnce();
  expect(showVideo).not.toHaveBeenCalled();

  video.dispatchEvent(new Event('loadeddata'));
  expect(showVideo).toHaveBeenCalledOnce();
  expect(showPoster).toHaveBeenCalledOnce();
});

it('restores the poster after a video error and does not let a late poster replace video', () => {
  const video = document.createElement('video');
  const showPoster = vi.fn();
  const showVideo = vi.fn();
  const releasePendingLoad = vi.fn();
  const state = bindSignalVideoTextureState(video, {
    showPoster,
    showVideo,
    releasePendingLoad,
  });
  state.markPosterLoaded();
  video.dispatchEvent(new Event('loadeddata'));

  state.markPosterLoaded();
  expect(showPoster).toHaveBeenCalledOnce();
  video.dispatchEvent(new Event('error'));
  expect(showPoster).toHaveBeenCalledTimes(2);
  expect(showVideo).toHaveBeenCalledOnce();
  expect(releasePendingLoad).toHaveBeenCalledOnce();

  state.dispose();
  video.dispatchEvent(new Event('loadeddata'));
  expect(showVideo).toHaveBeenCalledOnce();
});
