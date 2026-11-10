// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ColorDither } from './ColorDither';
import { openingDuration } from '../opening/cameraPath';

const mockRenderer = vi.hoisted(() => ({
  renderComposer: vi.fn(),
  renderScene: vi.fn(),
  addComposerPass: vi.fn(),
  frame: vi.fn<(state: unknown, delta: number) => void>(),
}));
vi.mock('@react-three/fiber', () => {
  const state = {
    gl: {
      getPixelRatio: () => 1.5,
      render: mockRenderer.renderScene,
      outputColorSpace: 'srgb',
      toneMapping: 0,
      toneMappingExposure: 1,
    },
    scene: {},
    camera: {},
    size: { width: 1600, height: 900 },
  };
  return {
    useThree: () => state,
    useFrame: (callback: typeof mockRenderer.frame) => {
      mockRenderer.frame = callback;
    },
  };
});
vi.mock('three/addons/postprocessing/EffectComposer.js', () => ({
  EffectComposer: class {
    addPass = mockRenderer.addComposerPass;
    setPixelRatio() {}
    setSize() {}
    dispose() {}
    render = mockRenderer.renderComposer;
  },
}));
vi.mock('three/addons/postprocessing/RenderPass.js', () => ({
  RenderPass: class {
    dispose() {}
  },
}));
vi.mock('three/addons/postprocessing/ShaderPass.js', () => ({
  ShaderPass: class {
    uniforms: unknown;
    material = {
      defines: {} as Record<string, string>,
      needsUpdate: false,
      uniforms: { toneMappingExposure: { value: 1 } },
    };
    constructor(shader: { uniforms: unknown }) {
      this.uniforms = shader.uniforms;
    }
    dispose() {}
  },
}));

it('skips all room post-processing after TV entry and resumes it on replay', () => {
  const elapsedRef = { current: openingDuration - 0.01 };
  render(<ColorDither elapsedRef={elapsedRef} />);
  mockRenderer.frame({}, 1 / 60);
  expect(mockRenderer.renderComposer).toHaveBeenCalledTimes(1);
  elapsedRef.current = openingDuration;
  mockRenderer.frame({}, 1 / 60);
  expect(mockRenderer.renderComposer).toHaveBeenCalledTimes(1);
  expect(mockRenderer.renderScene).not.toHaveBeenCalled();
  elapsedRef.current = 0;
  mockRenderer.frame({}, 1 / 60);
  expect(mockRenderer.renderComposer).toHaveBeenCalledTimes(2);
});

it('uses one scene pass and one combined output-dither pass', () => {
  mockRenderer.addComposerPass.mockClear();
  const elapsedRef = { current: openingDuration - 0.01 };

  render(<ColorDither elapsedRef={elapsedRef} />);

  expect(mockRenderer.addComposerPass).toHaveBeenCalledTimes(2);
});
