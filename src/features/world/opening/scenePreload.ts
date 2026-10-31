// Native media only: keep Three.js out of the initial HTML bundle.
const videos = new Map<string, HTMLVideoElement>();
const listeners = new Set<() => void>();
let progress = 0;
let preparation: Promise<void> | undefined;
export const minimumLoadingDuration = 800;
let loadingStartedAt: number | undefined;
const pendingSceneAssets = new Set<symbol>();
let sceneAssetCount = 0;
let sceneAssetsDone = 0;
export const areSceneAssetsReady = () => pendingSceneAssets.size === 0;
export function trackSceneAsset() {
  const id = Symbol();
  pendingSceneAssets.add(id);
  sceneAssetCount++;
  return () => {
    if (!pendingSceneAssets.delete(id)) return;
    sceneAssetsDone++;
    reportLoading(85 + (10 * sceneAssetsDone) / sceneAssetCount);
  };
}
export function getLoadingStartedAt() {
  return (loadingStartedAt ??= Date.now());
}
export function getLoadingRemaining() {
  return Math.max(
    0,
    minimumLoadingDuration - (Date.now() - getLoadingStartedAt()),
  );
}
export const getLoadingProgress = () => progress;
export function subscribeLoading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function reportLoading(value: number) {
  progress = Math.max(progress, Math.min(100, value));
  listeners.forEach((listener) => listener());
}
export function takePreparedVideo(url: string) {
  const video = videos.get(url) ?? document.createElement('video');
  videos.delete(url);
  return video;
}

/** Warm the actual decoders used by the scene, not a second set of downloads.
 * Progress measures completed preparation tasks, not network byte percentage.
 * Failed/slow media falls back to the existing posters without blocking entry.
 */
export function prepareScene(posterOnlyExterior = false) {
  if (preparation) return preparation;
  const reduced = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const tasks: Array<[string, boolean]> = [
    ['/media/exterior/black-hole-poster.jpg', false],
    ['/media/aosol-title-poster.png', false],
    ...(!reduced
      ? [
          ...(!posterOnlyExterior
            ? ([['/media/exterior/black-hole.mp4', true]] as [string, boolean][])
            : []),
          ['/media/aosol-title.mp4', true] as [string, boolean],
        ]
      : []),
  ];
  let completed = 0;
  preparation = Promise.all(
    tasks.map(
      ([url, isVideo]) =>
        new Promise<void>((resolve) => {
          const media = isVideo ? document.createElement('video') : new Image();
          const event = isVideo ? 'loadeddata' : 'load';
          const finish = () => {
            clearTimeout(timeout);
            media.removeEventListener(event, finish);
            media.removeEventListener('error', finish);
            reportLoading((++completed / tasks.length) * 70);
            resolve();
          };
          const timeout = window.setTimeout(finish, 10000);
          media.addEventListener(event, finish, { once: true });
          media.addEventListener('error', finish, { once: true });
          if (media instanceof HTMLVideoElement) {
            media.muted = true;
            media.loop = true;
            media.playsInline = true;
            media.preload = 'auto';
            videos.set(url, media);
          }
          media.src = url;
        }),
    ),
  ).then(() => undefined);
  return preparation;
}
