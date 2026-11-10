import {
  Mesh,
  Texture,
  VideoTexture,
  type Scene,
  type WebGLRenderer,
} from 'three';

/** Prepare static GPU inputs before their first appearance in the camera path. */
export function prepareSceneResources(
  renderer: Pick<WebGLRenderer, 'initTexture'>,
  scenes: readonly Scene[],
) {
  const staticTextures = new Set<Texture>();
  const meshGeometries = new Set<Mesh['geometry']>();
  const collectStaticTexture = (value: unknown) => {
    if (
      value instanceof Texture &&
      !(value instanceof VideoTexture) &&
      !value.isRenderTargetTexture &&
      value.image
    )
      staticTextures.add(value);
  };
  for (const scene of scenes)
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      meshGeometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        Object.values(material).forEach(collectStaticTexture);
        if ('uniforms' in material) {
          for (const uniform of Object.values(
            material.uniforms as Record<string, { value: unknown }>,
          ))
            collectStaticTexture(uniform.value);
        }
      }
    });
  // Existing bounds on animated water remain untouched.
  for (const geometry of meshGeometries)
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  for (const texture of staticTextures) renderer.initTexture(texture);
}
