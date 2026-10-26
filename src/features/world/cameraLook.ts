import { PerspectiveCamera, Vector3 } from 'three';

export type PointerLook = { x: number; y: number };
const worldUp = new Vector3(0, 1, 0);
const limit = (value: number) => Math.max(-1, Math.min(1, value));
const horizontalLookAngle = (Math.PI * 8) / 180;
const verticalLookAngle = (Math.PI * 5) / 180;

// Apply only an orientation offset after the approved camera pose has been restored.
// Exponential damping responds consistently to mouse/trackpad events at any frame rate.
export function applyPointerLook(
  camera: PerspectiveCamera,
  target: PointerLook,
  current: PointerLook,
  delta: number,
) {
  const blend = 1 - Math.exp(-8 * Math.max(0, Math.min(delta, 0.1)));
  current.x += (limit(target.x) - current.x) * blend;
  current.y += (limit(target.y) - current.y) * blend;
  camera.rotateOnWorldAxis(worldUp, -current.x * horizontalLookAngle);
  camera.rotateX(-current.y * verticalLookAngle);
}
