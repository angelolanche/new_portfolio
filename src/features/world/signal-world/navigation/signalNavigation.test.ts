import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { projects, signalVideoFor } from '../../../../content/projects';
import { signalSunPosition } from '../signalLayout';
import {
  advanceSignal,
  nextWorkProgress,
  isSignalTravelling,
  signalTravelDuration,
  signalCameraOffset,
  signalCameraAngles,
  type SignalNavigation,
} from './signalNavigation';

const navigation = (): SignalNavigation => ({
  progress: 0,
  target: 0.76,
  detailOpen: false,
  reducedMotion: false,
});

describe('signal travel', () => {
  it('accelerates gently, brakes gently and unlocks at the exact end of a finite journey', () => {
    const state: SignalNavigation = {
      ...navigation(),
      target: projects[0].progress,
    };
    const frames = Math.round(signalTravelDuration * 60);
    const samples = [state.progress];
    for (let frame = 0; frame < frames + 1; frame++) {
      advanceSignal(state, 1 / 60);
      samples.push(state.progress);
    }
    const middleStep =
      samples[Math.floor(frames / 2) + 1] - samples[Math.floor(frames / 2)];
    expect(samples[1]).toBeLessThan(middleStep * 0.01);
    expect(samples[frames - 1] - samples[frames - 2]).toBeLessThan(
      middleStep * 0.01,
    );
    expect(state.progress).toBe(state.target);
    expect(isSignalTravelling(state)).toBe(false);
    state.target = projects[1].progress;
    advanceSignal(state, 1 / 60);
    expect(state.progress).toBeGreaterThan(projects[0].progress);
    expect(isSignalTravelling(state)).toBe(true);
  });
  it('selects adjacent destinations in both directions and always arrives exactly', () => {
    const stops = [0, ...projects.map((project) => project.progress), 1];
    for (let i = 0; i < stops.length; i++) {
      expect(nextWorkProgress(stops[i], 1)).toBe(
        stops[Math.min(i + 1, stops.length - 1)],
      );
      expect(nextWorkProgress(stops[i], -1)).toBe(stops[Math.max(i - 1, 0)]);
    }
    const state = { ...navigation(), target: projects[0].progress };
    expect(isSignalTravelling(state)).toBe(true);
    for (let i = 0; i < 300; i++) advanceSignal(state, 1 / 60);
    expect(state.progress).toBe(projects[0].progress);
    expect(isSignalTravelling(state)).toBe(false);
  });
  it('eases consistently across frame rates and holds the complete travel state during a project', () => {
    const fast = navigation();
    const slow = navigation();
    for (let i = 0; i < 120; i++) advanceSignal(fast, 1 / 120);
    for (let i = 0; i < 30; i++) advanceSignal(slow, 1 / 30);
    expect(fast.progress).toBeCloseTo(slow.progress, 10);
    fast.detailOpen = true;
    const snapshot = { ...fast };
    advanceSignal(fast, 0.1);
    expect(fast).toEqual(snapshot);
    fast.detailOpen = false;
    advanceSignal(fast, 1 / 60);
    expect(fast.progress).toBeGreaterThan(snapshot.progress);
  });

  it('keeps every work ahead and centered at its index destination, then ends before the sun', () => {
    expect(signalCameraOffset(0, new Vector3()).length()).toBe(0);
    for (const project of projects) {
      const position = signalCameraOffset(project.progress, new Vector3()).add(
        new Vector3(0, 0, -1.5),
      );
      const angles = signalCameraAngles(project.progress);
      const camera = new PerspectiveCamera(42, 16 / 9, 0.03, 400);
      camera.position.copy(position);
      camera.rotation.set(angles.pitch, angles.yaw, 0, 'YXZ');
      camera.updateMatrixWorld();
      const center = new Vector3(...project.position).project(camera);
      expect(Math.abs(center.x)).toBeLessThan(0.001);
      expect(Math.abs(center.y)).toBeLessThan(0.001);
      expect(center.z).toBeGreaterThan(-1);
      expect(center.z).toBeLessThan(1);
      expect(
        position.distanceTo(new Vector3(...project.position)),
      ).toBeGreaterThan(8);
      expect(
        position.distanceTo(new Vector3(...project.position)),
      ).toBeLessThan(10);
    }
    const end = signalCameraOffset(1, new Vector3());
    expect(end.x).toBe(0);
    expect(end.y).toBeGreaterThan(20);
    expect(end.z - 1.5 - -125.4).toBeGreaterThan(19);
    expect(signalCameraAngles(1).yaw).toBeCloseTo(-Math.PI * 2);
    const sunCamera = new PerspectiveCamera(50, 16 / 9, 0.03, 400);
    sunCamera.position.copy(end).add(new Vector3(0, 0, -1.5));
    const sunAngles = signalCameraAngles(1);
    sunCamera.rotation.set(sunAngles.pitch, sunAngles.yaw, 0, 'YXZ');
    sunCamera.updateMatrixWorld();
    const sun = new Vector3(...signalSunPosition).project(sunCamera);
    expect(Math.abs(sun.x)).toBeLessThan(0.001);
    expect(Math.abs(sun.y)).toBeLessThan(0.001);
    expect(sun.z).toBeLessThan(1);
    const quadrants = new Set(
      projects.map(
        (p) => `${Math.sign(p.position[0])},${Math.sign(p.position[2] + 52.8)}`,
      ),
    );
    expect(quadrants.size).toBeGreaterThanOrEqual(4);
    expect(signalCameraOffset(2, new Vector3())).toEqual(end);
  });

  it('keeps later work blocks clear of the route from the title to the first work', () => {
    const first = projects[0];
    for (let step = 0; step <= 24; step++) {
      const progress = (first.progress * step) / 24;
      const cameraPosition = signalCameraOffset(progress, new Vector3()).add(
        new Vector3(0, 0, -1.5),
      );
      for (const project of projects.slice(1)) {
        const video = signalVideoFor(project);
        const blockRadius =
          (Math.hypot((5.5 * video.width) / video.height, 5.5) *
            project.scale) /
          2;
        expect(
          cameraPosition.distanceTo(new Vector3(...project.position)),
          `${project.title} intersects the entrance route at ${progress}`,
        ).toBeGreaterThan(blockRadius + 2);
      }
    }
  });

  it('uses immediate bounded navigation for reduced motion', () => {
    const state = { ...navigation(), reducedMotion: true, target: 5 };
    advanceSignal(state, 1 / 60);
    expect(state.progress).toBe(1);
    state.target = -1;
    advanceSignal(state, 1 / 60);
    expect(state.progress).toBe(0);
  });
});
