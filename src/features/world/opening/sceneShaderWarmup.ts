import type { Camera, Scene, WebGLRenderer } from 'three';
import { areSceneAssetsReady, trackSceneAsset } from './scenePreload';

/** Compile offscreen materials too, while the loading overlay still owns input. */
export function createSceneShaderWarmup() {
  let started = false;
  return (
    renderer: Pick<WebGLRenderer, 'compileAsync'>,
    scenes: ReadonlyArray<readonly [Scene, Camera]>,
  ) => {
    if (started || !areSceneAssetsReady()) return;
    started = true;
    const done = trackSceneAsset();
    // Invoke compilation synchronously while the caller's render target is bound.
    // A failed scene must not release loading while another still compiles.
    const preparations = scenes.map(([scene, camera]) => {
      try {
        return renderer.compileAsync(scene, camera);
      } catch (error) {
        return Promise.reject(error);
      }
    });
    void Promise.allSettled(preparations)
      .then((results) => {
        for (const result of results) {
          if (result.status !== 'rejected') continue;
          console.warn(
            'Scene shader warm-up failed; using normal rendering.',
            result.reason,
          );
        }
      })
      .finally(done);
  };
}
