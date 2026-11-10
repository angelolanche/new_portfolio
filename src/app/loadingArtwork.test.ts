// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { showLoadingArtwork } from './loadingArtwork';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('waits for every image and a paint opportunity before permitting application startup', async () => {
  document.body.innerHTML = '<div id="boot-loader"><img><img><img></div>';
  const decoders: Array<() => void> = [];
  document.querySelectorAll('img').forEach((image) => {
    image.decode = () => new Promise<void>((resolve) => decoders.push(resolve));
  });
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  const startApp = vi.fn();
  const ready = showLoadingArtwork().then(startApp);
  decoders[0]();
  decoders[1]();
  await Promise.resolve();
  expect(document.getElementById('boot-loader')).not.toHaveClass(
    'is-art-ready',
  );
  expect(frames).toHaveLength(0);
  decoders[2]();
  await vi.waitFor(() => expect(frames).toHaveLength(1));
  expect(document.getElementById('boot-loader')).toHaveClass('is-art-ready');
  expect(startApp).not.toHaveBeenCalled();
  frames.shift()!(0);
  expect(startApp).not.toHaveBeenCalled();
  frames.shift()!(16);
  await ready;
  expect(startApp).toHaveBeenCalledOnce();
});

it('permits startup with the HTML caption when an image fails to decode', async () => {
  document.body.innerHTML =
    '<div id="boot-loader"><img><span>loading...</span></div>';
  document.querySelector('img')!.decode = () =>
    Promise.reject(new Error('image unavailable'));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  await showLoadingArtwork();
  expect(document.getElementById('boot-loader')).not.toHaveClass(
    'is-art-ready',
  );
  expect(document.getElementById('boot-loader')).toHaveTextContent(
    'loading...',
  );
});
