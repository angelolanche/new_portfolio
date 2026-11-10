import { expect, it, vi } from 'vitest';
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
  ShaderMaterial,
  Texture,
  VideoTexture,
  WebGLRenderTarget,
  Sphere,
  Vector3,
} from 'three';
import { prepareSceneResources } from './sceneResources';

it('uploads shared textures once and computes missing bounds before first visibility', () => {
  const texture = new Texture({ width: 2, height: 2 });
  const geometry = new BoxGeometry();
  const scene = new Scene();
  const hidden = new Mesh(
    geometry,
    new MeshStandardMaterial({ map: texture, bumpMap: texture }),
  );
  hidden.visible = false;
  scene.add(
    hidden,
    new Mesh(
      geometry,
      new ShaderMaterial({ uniforms: { image: { value: texture } } }),
    ),
  );
  const bounds = vi.spyOn(geometry, 'computeBoundingSphere');
  const initTexture = vi.fn();
  prepareSceneResources({ initTexture }, [scene]);
  expect(initTexture).toHaveBeenCalledExactlyOnceWith(texture);
  expect(bounds).toHaveBeenCalledOnce();
  expect(geometry.boundingSphere!.radius).toBeCloseTo(Math.sqrt(3) / 2, 12);
  expect(
    geometry.boundingSphere!.containsPoint(new Vector3(0.49, 0.49, 0.49)),
  ).toBe(true);
  bounds.mockRestore();
  geometry.dispose();
  texture.dispose();
});

it('leaves video textures to their decoded-frame upload lifecycle', () => {
  const video = {
    requestVideoFrameCallback: vi.fn(),
    cancelVideoFrameCallback: vi.fn(),
  } as unknown as HTMLVideoElement;
  const texture = new VideoTexture(video);
  const scene = new Scene();
  const geometry = new BoxGeometry();
  const material = new MeshStandardMaterial({ map: texture });
  scene.add(new Mesh(geometry, material));
  const initTexture = vi.fn();
  prepareSceneResources({ initTexture }, [scene]);
  expect(initTexture).not.toHaveBeenCalled();
  texture.dispose();
  material.dispose();
  geometry.dispose();
});

it('preserves existing animated bounds and skips render-target or missing images', () => {
  const target = new WebGLRenderTarget(2, 2);
  const empty = new Texture();
  const geometry = new BoxGeometry();
  const bounds = new Sphere(new Vector3(1, 2, 3), 7);
  geometry.boundingSphere = bounds;
  const scene = new Scene();
  scene.add(
    new Mesh(
      geometry,
      new MeshStandardMaterial({ map: target.texture, bumpMap: empty }),
    ),
  );
  const initTexture = vi.fn();
  prepareSceneResources({ initTexture }, [scene]);
  expect(initTexture).not.toHaveBeenCalled();
  expect(geometry.boundingSphere).toBe(bounds);
  target.dispose();
  empty.dispose();
  geometry.dispose();
});
