import type { Camera, Scene, WebGLRenderer } from 'three';
import { areSceneAssetsReady, trackSceneAsset } from './scenePreload';
import { prepareSceneResources } from './sceneResources';

/** Prepare static resources and compile materials while loading still owns input. */
export function createSceneWarmup() {
  let hasStarted = false;
  return (
    renderer: Pick<WebGLRenderer, 'compileAsync' | 'initTexture'>,
    scenes: ReadonlyArray<readonly [Scene, Camera]>,
  ) => {
    if (hasStarted || !areSceneAssetsReady()) return;
    hasStarted = true;
    const finishPreparation = trackSceneAsset();
    // Invoke compilation synchronously while the caller's render target is bound.
    // A failed scene must not release loading while another still compiles.
    const scenePreparations = scenes.map(([scene, camera]) => {
      try {
        prepareSceneResources(renderer, [scene]);
        return renderer.compileAsync(scene, camera);
      } catch (error) {
        return Promise.reject(error);
      }
    });
    void Promise.allSettled(scenePreparations)
      .then((results) => {
        for (const result of results) {
          if (result.status !== 'rejected') continue;
          console.warn(
            'Scene resource warm-up failed; using normal rendering.',
            result.reason,
          );
        }
      })
      .finally(finishPreparation);
  };
}
