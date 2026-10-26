// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ColorDither } from './ColorDither';
import { openingDuration } from './cameraPath';

const renderer = vi.hoisted(() => ({
  compose: vi.fn(),
  draw: vi.fn(),
  frame: vi.fn<(state: unknown, delta: number) => void>(),
}));
vi.mock('@react-three/fiber', () => {
  const state = {
    gl: { getPixelRatio: () => 1.5, render: renderer.draw },
    scene: {},
    camera: {},
    size: { width: 1600, height: 900 },
  };
  return {
    useThree: () => state,
    useFrame: (callback: typeof renderer.frame) => {
      renderer.frame = callback;
    },
  };
});
vi.mock('three/addons/postprocessing/EffectComposer.js', () => ({
  EffectComposer: class {
    addPass() {}
    setPixelRatio() {}
    setSize() {}
    dispose() {}
    render = renderer.compose;
  },
}));
vi.mock('three/addons/postprocessing/RenderPass.js', () => ({
  RenderPass: class {
    dispose() {}
  },
}));
vi.mock('three/addons/postprocessing/OutputPass.js', () => ({
  OutputPass: class {
    dispose() {}
  },
}));
vi.mock('three/addons/postprocessing/ShaderPass.js', () => ({
  ShaderPass: class {
    uniforms: unknown;
    constructor(shader: { uniforms: unknown }) {
      this.uniforms = shader.uniforms;
    }
    dispose() {}
  },
}));

it('skips all room post-processing after TV entry and resumes it on replay', () => {
  const elapsedRef = { current: openingDuration - 0.01 };
  render(<ColorDither elapsedRef={elapsedRef} />);
  renderer.frame({}, 1 / 60);
  expect(renderer.compose).toHaveBeenCalledTimes(1);
  elapsedRef.current = openingDuration;
  renderer.frame({}, 1 / 60);
  expect(renderer.compose).toHaveBeenCalledTimes(1);
  expect(renderer.draw).not.toHaveBeenCalled();
  elapsedRef.current = 0;
  renderer.frame({}, 1 / 60);
  expect(renderer.compose).toHaveBeenCalledTimes(2);
});
