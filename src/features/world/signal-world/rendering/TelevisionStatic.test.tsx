// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
} from 'three';
import { projects } from '../../../../content/projects';
import { TelevisionStatic } from './TelevisionStatic';
import { createFlight } from '../navigation/signalNavigation';
import { sampleOpening, openingDuration } from '../../opening/cameraPath';
import { signalEntryEnd } from '../../opening/timing';
import { signalCameraAngles } from '../navigation/signalNavigation';

const harness = vi.hoisted(() => ({
  callback: null as ((state: unknown, delta: number) => void) | null,
  canvas: null as HTMLCanvasElement | null,
  compositor: null as null | {
    uniforms: Record<string, { value: unknown }>;
    vertexShader: string;
    fragmentShader: string;
    toneMapped: boolean;
  },
}));
vi.mock('@react-three/fiber', () => ({
  createPortal: (node: {
    type: unknown;
    props: {
      children?: {
        type: string;
        props: NonNullable<typeof harness.compositor> & {
          ref: { current: unknown };
        };
      }[];
    };
  }) => {
    // Connect the actual compositor ref/uniforms without requiring a WebGL context.
    if (node.type === 'mesh') {
      const props = node.props.children!.find(
        (child) => child.type === 'shaderMaterial',
      )!.props;
      props.ref.current = { uniforms: props.uniforms };
      harness.compositor = props;
    }
    return null;
  },
  useFrame: (callback: typeof harness.callback) => {
    harness.callback = callback;
  },
  useThree: (selector: (state: unknown) => unknown) =>
    selector({ gl: { domElement: harness.canvas } }),
}));

it('preserves the handoff, eases into each destination and restores free flight on arrival', () => {
  harness.canvas = document.createElement('canvas');
  const elapsedRef = { current: openingDuration - 0.000001 };
  const navigationRef = {
    current: {
      progress: 0,
      target: 0,
      detailOpen: false,
      reducedMotion: false,
      flight: createFlight(),
    },
  };
  const onEntered = vi.fn();
  const onProject = vi.fn();
  const openingReadyRef = { current: false };
  // Exercise frame/render hooks without mounting Three objects into a DOM or requiring a GPU.
  renderHook(() =>
    TelevisionStatic({
      playing: false,
      colorDither: true,
      elapsedRef,
      navigationRef,
      onEntered,
      onProject,
      openingReadyRef,
    }),
  );
  const camera = new PerspectiveCamera(42, 16 / 9, 0.03, 400);
  const pose = sampleOpening(openingDuration, 16 / 9);
  camera.fov = pose.fov;
  camera.updateProjectionMatrix();
  camera.position.copy(pose.position);
  camera.lookAt(pose.target);
  const render = vi.fn();
  const gl = {
    autoClear: true,
    getDrawingBufferSize: (value: Vector2) => value.set(1600, 900),
    getRenderTarget: () => null,
    setRenderTarget: vi.fn(),
    render,
  };
  const state = {
    gl,
    camera,
    scene: new Scene(),
    size: { width: 1600, height: 900 },
  };
  harness.callback!(state, 1 / 60);
  expect(openingReadyRef.current).toBe(false);
  expect(render.mock.calls.at(-1)![0]).not.toBe(state.scene);
  expect(camera.layers.mask).toBe(1);
  harness.callback!(state, 1 / 60);
  expect(openingReadyRef.current).toBe(true);
  const before = (
    render.mock.calls[0][1] as PerspectiveCamera
  ).position.clone();
  expect(onEntered).not.toHaveBeenCalled();
  expect(harness.compositor!.uniforms.entered.value).toBe(false);
  elapsedRef.current = openingDuration;
  render.mockClear();
  harness.callback!(state, 1 / 60);
  const worldCamera = render.mock.calls[0][1] as PerspectiveCamera;
  expect(worldCamera.position.distanceTo(before)).toBeLessThan(1e-8);
  expect(onEntered).toHaveBeenCalledOnce();
  expect(harness.compositor!.uniforms.entered.value).toBe(true);
  expect(harness.compositor!.toneMapped).toBe(false);
  expect(harness.compositor!.vertexShader).toContain('uniform bool entered');
  expect(harness.compositor!.fragmentShader).toContain('if (!entered &&');
  // The same world-camera raycast opens a 3D plaque, while drags do not open it.
  const world = render.mock.calls[0][0] as Scene;
  const plaque = new Group();
  plaque.userData.project = projects[0].slug;
  plaque.position
    .copy(worldCamera.position)
    .add(new Vector3(0, 0, -5).applyQuaternion(worldCamera.quaternion));
  plaque.quaternion.copy(worldCamera.quaternion);
  const plaqueGeometry = new BoxGeometry(2, 0.8, 0.2);
  const plaqueMaterial = new MeshBasicMaterial();
  plaque.add(new Mesh(plaqueGeometry, plaqueMaterial));
  world.add(plaque);
  world.updateMatrixWorld(true);
  vi.spyOn(harness.canvas, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 1600,
    height: 900,
  } as DOMRect);
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerdown', { clientX: 800, clientY: 450 }),
  );
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerup', { clientX: 830, clientY: 450 }),
  );
  expect(onProject).not.toHaveBeenCalled();
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerdown', { clientX: 800, clientY: 450 }),
  );
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerup', { clientX: 800, clientY: 450 }),
  );
  expect(onProject).toHaveBeenCalledWith(projects[0]);
  // Fixed 3D labels use the same nearest-surface picking as the films.
  const neighbor = new Group();
  neighbor.userData.project = projects[1].slug;
  neighbor.position
    .copy(worldCamera.position)
    .add(new Vector3(0, 0, -3).applyQuaternion(worldCamera.quaternion));
  neighbor.quaternion.copy(worldCamera.quaternion);
  neighbor.add(new Mesh(plaqueGeometry, plaqueMaterial));
  world.add(neighbor);
  world.updateMatrixWorld(true);
  onProject.mockClear();
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerdown', { clientX: 800, clientY: 450 }),
  );
  harness.canvas.dispatchEvent(
    new MouseEvent('pointerup', { clientX: 800, clientY: 450 }),
  );
  expect(onProject).toHaveBeenCalledExactlyOnceWith(projects[1]);
  world.remove(neighbor);
  world.remove(plaque);
  plaqueGeometry.dispose();
  plaqueMaterial.dispose();
  navigationRef.current.flight.movement.forward = 1;
  harness.callback!(state, 1 / 60);
  expect(navigationRef.current.flight.position.z).toBeLessThan(0);
  const snapshot = worldCamera.position.clone();
  navigationRef.current.detailOpen = true;
  harness.callback!(state, 1 / 60);
  expect(worldCamera.position.toArray()).toEqual(snapshot.toArray());
  navigationRef.current.detailOpen = false;
  navigationRef.current.target = projects[1].progress;
  elapsedRef.current = signalEntryEnd;
  // A deliberately off-center pointer must not displace the destination in flight.
  camera.rotation.set(0.5, 1.2, 0);
  navigationRef.current.flight.movement.forward = 0;
  for (let frame = 0; frame < 165; frame++) {
    const orientation = worldCamera.quaternion.clone();
    harness.callback!(state, 1 / 60);
    expect(worldCamera.quaternion.angleTo(orientation)).toBeLessThan(0.12);
    const center = new Vector3(...projects[1].position).project(worldCamera);
    if (frame >= 54) {
      expect(Math.abs(center.x)).toBeLessThan(1e-8);
      expect(Math.abs(center.y)).toBeLessThan(1e-8);
    }
    expect(center.z).toBeLessThan(1);
  }
  camera.rotation.set(0, 0, 0);
  for (let frame = 0; frame < 10; frame++) harness.callback!(state, 1 / 60);
  expect(navigationRef.current.progress).toBe(projects[1].progress);
  const arrived = worldCamera.position.clone();
  const freeOrientation = worldCamera.quaternion.clone();
  navigationRef.current.flight.movement.right = 1;
  for (let frame = 0; frame < 20; frame++) harness.callback!(state, 1 / 60);
  expect(worldCamera.position.distanceTo(arrived)).toBeGreaterThan(1);
  expect(worldCamera.quaternion.angleTo(freeOrientation)).toBeLessThan(1e-7);

  for (const progress of [0, 1]) {
    navigationRef.current.progress = navigationRef.current.target = progress;
    navigationRef.current.flight = createFlight();
    camera.rotation.set(0.2, 0.4, 0);
    harness.callback!(state, 1 / 60);
    const angles = signalCameraAngles(progress);
    const expected = new PerspectiveCamera();
    expected.rotation.set(angles.pitch, angles.yaw, 0, 'YXZ');
    expected.quaternion.multiply(camera.quaternion);
    expect(worldCamera.quaternion.angleTo(expected.quaternion)).toBeLessThan(
      1e-7,
    );
  }

  // Opening render work must stay inside the CRT's physical-pixel footprint.
  elapsedRef.current = 0;
  const initialPose = sampleOpening(0, 16 / 9);
  camera.position.copy(initialPose.position);
  camera.fov = initialPose.fov;
  camera.lookAt(initialPose.target);
  camera.updateProjectionMatrix();
  gl.setRenderTarget.mockClear();
  harness.callback!(state, 1 / 60);
  const crtTarget = gl.setRenderTarget.mock.calls[0][0];
  expect(crtTarget.width).toBe(1600);
  expect(crtTarget.height).toBe(900);
  expect(crtTarget.scissorTest).toBe(true);
  expect(harness.compositor!.uniforms.entered.value).toBe(false);
  expect(harness.compositor!.uniforms.image.value).toBe(crtTarget.texture);
  expect(crtTarget.scissor.z * crtTarget.scissor.w).toBeLessThan(
    1600 * 900 * 0.25,
  );
  expect(gl.setRenderTarget).toHaveBeenLastCalledWith(null);
  expect(gl.autoClear).toBe(true);

  // Entry preserves the offscreen color pipeline and removes the CRT scissor.
  elapsedRef.current = openingDuration;
  gl.setRenderTarget.mockClear();
  render.mockClear();
  harness.callback!(state, 1 / 60);
  expect(gl.setRenderTarget.mock.calls[0][0]).toBe(crtTarget);
  expect(crtTarget.scissorTest).toBe(false);
  expect(harness.compositor!.uniforms.entered.value).toBe(true);
  expect(harness.compositor!.uniforms.image.value).toBe(crtTarget.texture);
  expect(render).toHaveBeenCalledTimes(2);
  expect(render.mock.calls[0][0]).toBe(world);
  expect(render.mock.calls[1][0]).not.toBe(world);
  expect(gl.setRenderTarget).toHaveBeenLastCalledWith(null);

  render.mockImplementationOnce(() => {
    throw new Error('GPU render failed');
  });
  expect(() => harness.callback!(state, 1 / 60)).toThrow('GPU render failed');
  expect(gl.setRenderTarget).toHaveBeenLastCalledWith(null);
  expect(gl.autoClear).toBe(true);
});
