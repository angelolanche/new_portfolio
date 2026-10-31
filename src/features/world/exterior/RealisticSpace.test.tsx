// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { NoBlending, ShaderMaterial, Texture, VideoTexture } from 'three';
import { RealisticSpace } from './RealisticSpace';
import type { SignalNavigation } from '../signal-world/navigation/signalNavigation';
import { openingDuration } from '../opening/timing';

const harness = vi.hoisted(() => ({
  frame: null as (() => void) | null,
  loaded: null as (() => void) | null,
}));
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: () => void) => {
    harness.frame = callback;
  },
}));
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    TextureLoader: class {
      load(_url: string, onLoad: () => void) {
        harness.loaded = onLoad;
        return new actual.Texture();
      }
    },
  };
});

it.each([
  { reducedMotion: false, posterOnly: false },
  { reducedMotion: true, posterOnly: false },
  { reducedMotion: false, posterOnly: true },
])(
  'preserves the exterior render state (reduced motion=$reducedMotion, poster only=$posterOnly)',
  ({ reducedMotion, posterOnly }) => {
    const video = document.createElement('video');
    let ready = 0;
    Object.defineProperties(video, {
      duration: { value: 15 },
      readyState: { get: () => ready },
    });
    vi.spyOn(video, 'play').mockResolvedValue();
    vi.spyOn(video, 'pause').mockImplementation(() => {});
    const load = vi.spyOn(video, 'load').mockImplementation(() => {});
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) =>
      tag === 'video' ? video : createElement(tag, options),
    );
    const navigationRef = {
      current: { reducedMotion, detailOpen: false } as SignalNavigation,
    };
    const elapsedRef = { current: 0 };
    const props = {
      onReady: vi.fn(),
      elapsedRef,
      playing: true,
      navigationRef,
      colorDither: true,
      posterOnly,
    };
    const view = renderHook((props) => RealisticSpace(props), {
      initialProps: props,
    });
    const material = view.result.current.props.material as ShaderMaterial;
    expect(material.blending).toBe(NoBlending);
    expect(material.transparent).toBe(false);
    expect(material.depthWrite).toBe(false);
    harness.loaded!();
    const afterRender = () =>
      (view.result.current.props.onAfterRender as () => void)();
    afterRender();
    expect(props.onReady).toHaveBeenCalledTimes(
      reducedMotion || posterOnly ? 1 : 0,
    );
    const poster = material.uniforms.image.value as Texture;
    const disposePoster = vi.spyOn(poster, 'dispose');
    const disposeMaterial = vi.spyOn(material, 'dispose');
    harness.frame!();
    expect(material.uniforms.bypassDither.value).toBe(true);
    expect(material.uniforms.videoFrame.value).toBe(false);
    expect(video.hasAttribute('src')).toBe(!reducedMotion && !posterOnly);
    if (!reducedMotion && !posterOnly) {
      ready = 2;
      video.dispatchEvent(new Event('loadeddata'));
      expect(material.uniforms.image.value).toBeInstanceOf(VideoTexture);
      expect(material.uniforms.videoFrame.value).toBe(true);
      expect(
        (material.uniforms.image.value as VideoTexture).version,
      ).toBeGreaterThan(0);
      expect(props.onReady).not.toHaveBeenCalled();
      afterRender();
      afterRender();
      expect(props.onReady).toHaveBeenCalledOnce();
      elapsedRef.current = openingDuration;
      harness.frame!();
      expect(video.hasAttribute('src')).toBe(false);
      expect(material.uniforms.image.value).toBe(poster);
      expect(material.uniforms.videoFrame.value).toBe(false);
      elapsedRef.current = 0;
      ready = 0;
      harness.frame!();
      expect(video.hasAttribute('src')).toBe(true);
      video.dispatchEvent(new Event('error'));
      expect(material.uniforms.image.value).toBe(poster);
      expect(material.uniforms.videoFrame.value).toBe(false);
      expect(video.hasAttribute('src')).toBe(false);
    }
    view.rerender({ ...props, colorDither: false });
    harness.frame!();
    expect(material.uniforms.bypassDither.value).toBe(false);
    view.unmount();
    expect(disposePoster).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(video.hasAttribute('src')).toBe(false);
    if (reducedMotion) expect(load).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  },
);
