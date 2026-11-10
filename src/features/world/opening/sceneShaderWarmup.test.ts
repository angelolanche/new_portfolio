import { expect, it, vi } from 'vitest';
import { PerspectiveCamera, Scene } from 'three';
import { createSceneShaderWarmup } from './sceneShaderWarmup';
import { areSceneAssetsReady, trackSceneAsset } from './scenePreload';

it('waits for assets, compiles both scenes once and holds loading until all programs finish', async () => {
  const warm = createSceneShaderWarmup();
  const scene = new Scene();
  const world = new Scene();
  const camera = new PerspectiveCamera();
  const finish: Array<() => void> = [];
  const compileAsync = vi.fn(
    () => new Promise<Scene>((resolve) => finish.push(() => resolve(scene))),
  );
  const scenes = [
    [scene, camera],
    [world, camera],
  ] as const;
  const assetDone = trackSceneAsset();
  warm({ compileAsync }, scenes);
  expect(compileAsync).not.toHaveBeenCalled();
  assetDone();
  warm({ compileAsync }, scenes);
  expect(compileAsync.mock.calls).toHaveLength(2);
  expect(areSceneAssetsReady()).toBe(false);
  warm({ compileAsync }, scenes);
  expect(compileAsync.mock.calls).toHaveLength(2);
  finish[0]();
  await vi.waitFor(() => expect(areSceneAssetsReady()).toBe(false));
  finish[1]();
  await vi.waitFor(() => expect(areSceneAssetsReady()).toBe(true));
  warm({ compileAsync }, scenes);
  expect(compileAsync.mock.calls).toHaveLength(2);
});

it.each(['reject', 'throw'])(
  'releases loading after a compilation %s',
  async (failure) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const error = new Error('context lost');
      const compileAsync = vi.fn(() => {
        if (failure === 'throw') throw error;
        return Promise.reject(error);
      });
      createSceneShaderWarmup()({ compileAsync }, [
        [new Scene(), new PerspectiveCamera()],
      ]);
      await vi.waitFor(() => expect(areSceneAssetsReady()).toBe(true));
      expect(warning).toHaveBeenCalledWith(
        expect.stringContaining('warm-up failed'),
        error,
      );
    } finally {
      warning.mockRestore();
    }
  },
);

it.each(['reject', 'throw'])(
  'keeps waiting for the other scene after a compilation %s',
  async (failure) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      let finish: (() => void) | undefined;
      const error = new Error('first scene failed');
      const compileAsync = vi
        .fn()
        .mockImplementationOnce(() => {
          if (failure === 'throw') throw error;
          return Promise.reject(error);
        })
        .mockImplementationOnce(
          () =>
            new Promise<Scene>((resolve) => {
              finish = () => resolve(new Scene());
            }),
        );
      const scene = new Scene();
      const camera = new PerspectiveCamera();
      createSceneShaderWarmup()({ compileAsync }, [
        [scene, camera],
        [scene, camera],
      ]);
      expect(compileAsync).toHaveBeenCalledTimes(2);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(areSceneAssetsReady()).toBe(false);
      finish!();
      await vi.waitFor(() => expect(areSceneAssetsReady()).toBe(true));
      expect(warning).toHaveBeenCalledOnce();
    } finally {
      warning.mockRestore();
    }
  },
);
