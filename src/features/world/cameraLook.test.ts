import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { openingDuration, sampleLookWeight, sampleOpening } from './cameraPath';
import { applyPointerLook } from './cameraLook';

function cameraAt(time = 5) {
  const pose = sampleOpening(time, 16 / 9);
  const camera = new PerspectiveCamera(pose.fov, 16 / 9, 0.03, 40);
  camera.position.copy(pose.position);
  camera.lookAt(pose.target);
  return { camera, pose };
}
describe('fixed-position pointer look', () => {
  it('restores pointer control inside the TV without moving the camera position', () => {
    const current = { x: 0, y: 0 };
    const { camera, pose } = cameraAt(openingDuration);
    const baseline = camera.quaternion.clone();
    for (let frame = 0; frame <= 180; frame++) {
      camera.lookAt(pose.target);
      const weight = sampleLookWeight(openingDuration + frame / 60);
      applyPointerLook(camera, { x: weight, y: 0 }, current, 1 / 60);
      if (frame === 0)
        expect(camera.quaternion.angleTo(baseline)).toBeLessThan(1e-7);
    }
    expect(camera.quaternion.angleTo(baseline)).toBeGreaterThan(0.13);
    expect(camera.position).toEqual(pose.position);
    expect(sampleLookWeight(100)).toBe(1);
    for (let frame = 0; frame < 120; frame++) {
      camera.lookAt(pose.target);
      applyPointerLook(camera, { x: 0, y: 0 }, current, 1 / 60);
    }
    expect(camera.quaternion.angleTo(baseline)).toBeLessThan(1e-5);
  });
  it('looks toward the pointer without changing position, lens or the approved approach', () => {
    for (const time of [0, 2.5, 5, 12]) {
      const { camera, pose } = cameraAt(time);
      const before = camera.getWorldDirection(new Vector3());
      const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      applyPointerLook(camera, { x: 1, y: 0 }, { x: 0, y: 0 }, 0.1);
      expect(
        camera.getWorldDirection(new Vector3()).sub(before).dot(right),
      ).toBeGreaterThan(0);
      expect(camera.position).toEqual(pose.position);
      expect(camera.fov).toBe(pose.fov);
    }
    const { camera } = cameraAt();
    const direction = camera.getWorldDirection(new Vector3());
    applyPointerLook(camera, { x: 0, y: 1 }, { x: 0, y: 0 }, 0.1);
    expect(camera.getWorldDirection(new Vector3()).y).toBeLessThan(direction.y);
  });
  it('preserves the neutral view and bounds the look angle without accumulating rotation', () => {
    const { camera, pose } = cameraAt();
    const baseline = camera.quaternion.clone();
    const current = { x: 0, y: 0 };
    applyPointerLook(camera, { x: 0, y: 0 }, current, 0.016);
    expect(camera.quaternion.angleTo(baseline)).toBeLessThan(1e-7);
    for (let i = 0; i < 300; i++) {
      camera.lookAt(pose.target);
      applyPointerLook(camera, { x: 99, y: -99 }, current, 1 / 60);
    }
    expect(camera.quaternion.angleTo(baseline)).toBeGreaterThan(0.15);
    expect(camera.quaternion.angleTo(baseline)).toBeLessThan(0.18);
    for (let i = 0; i < 120; i++) {
      camera.lookAt(pose.target);
      applyPointerLook(camera, { x: 0, y: 0 }, current, 1 / 60);
    }
    expect(camera.quaternion.angleTo(baseline)).toBeLessThan(1e-5);
  });
  it('smooths consistently at different frame rates', () => {
    const states = [30, 60, 120].map((fps) => {
      const { camera, pose } = cameraAt();
      const current = { x: 0, y: 0 };
      for (let i = 0; i < fps; i++) {
        camera.lookAt(pose.target);
        applyPointerLook(camera, { x: 0.8, y: -0.4 }, current, 1 / fps);
      }
      return camera.quaternion;
    });
    expect(states[0].angleTo(states[1])).toBeLessThan(1e-7);
    expect(states[1].angleTo(states[2])).toBeLessThan(1e-7);
  });
});
