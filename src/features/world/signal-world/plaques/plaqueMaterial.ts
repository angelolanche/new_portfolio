import { MeshBasicMaterial, type Texture } from 'three';

/** Share the reference's red/blue edge separation without additional video decoders. */
export function createPlaqueMaterial(
  map: Texture | null,
  cleanReference = false,
  titleEffectTop = 1,
) {
  const time = { value: 0 };
  const material = new MeshBasicMaterial({ map, toneMapped: false });
  material.customProgramCacheKey = () =>
    `signal-plaque-${cleanReference ? 'reference' : 'text'}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.plaqueTime = time;
    shader.uniforms.plaqueTitleTop = { value: titleEffectTop };
    shader.fragmentShader = `uniform float plaqueTime;\nuniform float plaqueTitleTop;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      #ifdef USE_MAP
      ${
        cleanReference
          ? `
        // The supplied clip contains a small grey wedge beyond the final letter.
        if (vMapUv.x > 0.975 && vMapUv.y < 0.44) diffuseColor.rgb = vec3(1.0);
      `
          : `
        if (vMapUv.y < plaqueTitleTop) {
        float phase = floor(mod(plaqueTime, 1.6) * 15.0);
        float shift = sin(phase * 2.7) * 0.007;
        vec2 split = vec2(shift, 0.0);
        float redInk = 1.0 - texture2D(map, vMapUv + split).r;
        float blueInk = 1.0 - texture2D(map, vMapUv - split).r;
        diffuseColor.rgb = min(diffuseColor.rgb, mix(vec3(1.0), vec3(0.9, 0.01, 0.03), redInk));
        diffuseColor.rgb = min(diffuseColor.rgb, mix(vec3(1.0), vec3(0.02, 0.01, 1.0), blueInk));
        }
      `
      }
      #endif`,
    );
  };
  return { material, time };
}
