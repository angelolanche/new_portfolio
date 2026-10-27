import { useEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
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

// Post-processes the opening scene with the approved color dither treatment.
export function ColorDither({
  settings = defaultDitherSettings,
  elapsedRef,
}: {
  settings?: DitherSettings;
  elapsedRef?: RefObject<number>;
}) {
  const { gl, scene, camera, size } = useThree();
  const pipeline = useRef<{
    composer: EffectComposer;
    dither: ShaderPass;
  } | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const output = new OutputPass();
    const dither = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
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
    composer.addPass(render);
    composer.addPass(output);
    composer.addPass(dither);
    pipeline.current = { composer, dither };
    return () => {
      pipeline.current = null;
      render.dispose();
      output.dispose();
      dither.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    const current = pipeline.current;
    if (!current) return;
    const pixelRatio = gl.getPixelRatio();
    current.composer.setPixelRatio(pixelRatio);
    current.composer.setSize(size.width, size.height);
    current.dither.uniforms.resolution.value.set(
      size.width * pixelRatio,
      size.height * pixelRatio,
    );
  }, [gl, size.width, size.height]);

  useEffect(() => {
    if (pipeline.current) {
      const uniforms = pipeline.current.dither.uniforms;
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
    // and its three post-processing passes here would be immediately overwritten.
    if (elapsedRef && elapsedRef.current >= openingDuration) return;
    if (pipeline.current) pipeline.current.composer.render(delta);
    else state.gl.render(state.scene, state.camera);
  }, 1);
  return null;
}
