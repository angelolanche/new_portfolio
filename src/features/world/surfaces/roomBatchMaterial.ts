import { MeshStandardMaterial, type Material } from 'three';

// Material identity/name/listeners do not affect the image. Everything else is
// compared exactly, including linear colors, texture identities and render flags.
const ignored = new Set([
  'uuid',
  'name',
  'version',
  'userData',
  '_listeners',
  '__r3f',
]);
function appearance(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if ('isTexture' in value && value.isTexture && 'uuid' in value)
    return { texture: value.uuid };
  if ('toArray' in value && typeof value.toArray === 'function')
    return value.toArray();
  if (Array.isArray(value)) return value.map(appearance);
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, appearance(item)]),
  );
}

export function roomBatchMaterialKey(material: Material): string | null {
  if (
    !(material instanceof MeshStandardMaterial) ||
    material.type !== 'MeshStandardMaterial' ||
    material.userData.roomBatch === false ||
    material.transparent ||
    !material.visible ||
    material.clippingPlanes?.length ||
    material.onBeforeCompile !==
      MeshStandardMaterial.prototype.onBeforeCompile ||
    material.customProgramCacheKey !==
      MeshStandardMaterial.prototype.customProgramCacheKey ||
    material.onBeforeRender !== MeshStandardMaterial.prototype.onBeforeRender
  )
    return null;
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(material)
        .filter(([key]) => !ignored.has(key))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [key, appearance(value)]),
    ),
  );
}
