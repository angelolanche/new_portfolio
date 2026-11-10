import { useEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AgXToneMapping,
  ACESFilmicToneMapping,
  CineonToneMapping,
  ColorManagement,
  CustomToneMapping,
  LinearToneMapping,
  NeutralToneMapping,
  ReinhardToneMapping,
  SRGBTransfer,
  Vector2,
  Vector3,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { openingDuration } from '../opening/cameraPath';

import {
  defaultDitherSettings,
  ditherColors,
  displayRgb,
  ditherPatterns,
  ditherAdjustments,
  type DitherSettings,
} from './ditherSettings';

import { colorDitherFragmentShader } from './shaders/colorDitherShader';

function configureCombinedPassOutputTransform(
  material: {
    defines: Record<string, unknown>;
    needsUpdate: boolean;
    uniforms: Record<string, { value: unknown }>;
  },
  webglRenderer: {
    outputColorSpace: string;
    toneMapping: number;
    toneMappingExposure: number;
  },
) {
  const defines: Record<string, string> = {};
  if (
    ColorManagement.getTransfer(webglRenderer.outputColorSpace) === SRGBTransfer
  )
    defines.SRGB_TRANSFER = '';
  if (webglRenderer.toneMapping === LinearToneMapping)
    defines.LINEAR_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === ReinhardToneMapping)
    defines.REINHARD_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === CineonToneMapping)
    defines.CINEON_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === ACESFilmicToneMapping)
    defines.ACES_FILMIC_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === AgXToneMapping)
    defines.AGX_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === NeutralToneMapping)
    defines.NEUTRAL_TONE_MAPPING = '';
  else if (webglRenderer.toneMapping === CustomToneMapping)
    defines.CUSTOM_TONE_MAPPING = '';
  material.defines = defines;
  material.uniforms.toneMappingExposure.value =
    webglRenderer.toneMappingExposure;
  material.needsUpdate = true;
}

// Post-processes the opening scene with the approved color dither treatment.
export function ColorDither({
  settings = defaultDitherSettings,
  elapsedRef,
}: {
  settings?: DitherSettings;
  elapsedRef?: RefObject<number>;
}) {
  const { gl, scene, camera, size } = useThree();
  const roomPostProcessing = useRef<{
    composer: EffectComposer;
    combinedDitherPass: ShaderPass;
  } | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const scenePass = new RenderPass(scene, camera);
    const combinedDitherPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        toneMappingExposure: { value: gl.toneMappingExposure },
        resolution: { value: new Vector2() },
        cellSize: { value: defaultDitherSettings.cellSize },
        intensity: { value: defaultDitherSettings.intensity },
        levels: { value: defaultDitherSettings.levels },
        ...Object.fromEntries(
          ditherAdjustments.map(({ key }) => [
            key,
            { value: defaultDitherSettings[key] },
          ]),
        ),
        invert: { value: false },
        pattern: { value: 0 },
        duotone: { value: false },
        darkColor: { value: new Vector3() },
        lightColor: { value: new Vector3() },
      },
      vertexShader: `varying vec2 vUv;
        void main() { vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: colorDitherFragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    composer.addPass(scenePass);
    composer.addPass(combinedDitherPass);
    configureCombinedPassOutputTransform(combinedDitherPass.material, gl);
    roomPostProcessing.current = { composer, combinedDitherPass };
    return () => {
      roomPostProcessing.current = null;
      scenePass.dispose();
      combinedDitherPass.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    const activePipeline = roomPostProcessing.current;
    if (!activePipeline) return;
    const pixelRatio = gl.getPixelRatio();
    activePipeline.composer.setPixelRatio(pixelRatio);
    activePipeline.composer.setSize(size.width, size.height);
    activePipeline.combinedDitherPass.uniforms.resolution.value.set(
      size.width * pixelRatio,
      size.height * pixelRatio,
    );
  }, [gl, size.width, size.height]);

  useEffect(() => {
    if (roomPostProcessing.current) {
      const uniforms = roomPostProcessing.current.combinedDitherPass.uniforms;
      uniforms.cellSize.value = settings.cellSize * gl.getPixelRatio();
      uniforms.intensity.value = settings.intensity;
      uniforms.levels.value = settings.levels;
      uniforms.pattern.value = ditherPatterns[settings.style].id;
      for (const { key } of ditherAdjustments)
        uniforms[key].value = settings[key];
      uniforms.invert.value = settings.invert;
      uniforms.duotone.value = settings.palette !== 'original';
      const [dark, light] = ditherColors(settings);
      uniforms.darkColor.value.set(...displayRgb(dark));
      uniforms.lightColor.value.set(...displayRgb(light));
    }
  }, [settings, gl, scene, camera, size.width, size.height]);

  useFrame((state, delta) => {
    // TelevisionStatic owns the full viewport after entry. Rendering the room
    // and its room post-processing here would be immediately overwritten.
    if (elapsedRef && elapsedRef.current >= openingDuration) return;
    if (roomPostProcessing.current)
      roomPostProcessing.current.composer.render(delta);
    else state.gl.render(state.scene, state.camera);
  }, 1);
  return null;
}
