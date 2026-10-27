import { PerspectiveCamera, Vector3 } from 'three';
import { openingDuration } from './timing';

export type PointerLook = { x: number; y: number };
const worldUp = new Vector3(0, 1, 0);
const limit = (value: number) => Math.max(-1, Math.min(1, value));
const horizontalLookAngle = (Math.PI * 8) / 180;
const verticalLookAngle = (Math.PI * 5) / 180;

export const workLookAngle = Math.PI / 4;

export function sampleLookRange(seconds: number, inspecting = false) {
  const t = Math.max(0, Math.min(1, (seconds - openingDuration) / 1.2));
  const weight = t * t * (3 - 2 * t);
  return {
    horizontal:
      horizontalLookAngle +
      weight * ((inspecting ? workLookAngle : Math.PI) - horizontalLookAngle),
    vertical:
      verticalLookAngle +
      weight * ((inspecting ? workLookAngle : Math.PI / 2) - verticalLookAngle),
    unbounded: seconds >= openingDuration && !inspecting,
    response: 8 + weight * 2,
    weight,
  };
}

// Apply only an orientation offset after the approved camera pose has been restored.
// Exponential damping responds consistently to mouse/trackpad events at any frame rate.
export function applyPointerLook(
  camera: PerspectiveCamera,
  target: PointerLook,
  current: PointerLook,
  delta: number,
  range: {
    horizontal: number;
    vertical: number;
    unbounded?: boolean;
    response?: number;
  } = { horizontal: horizontalLookAngle, vertical: verticalLookAngle },
) {
  const blend =
    1 - Math.exp(-(range.response ?? 8) * Math.max(0, Math.min(delta, 0.1)));
  current.x +=
    ((range.unbounded ? target.x : limit(target.x)) - current.x) * blend;
  current.y += (limit(target.y) - current.y) * blend;
  camera.rotateOnWorldAxis(worldUp, -current.x * range.horizontal);
  camera.rotateX(-current.y * range.vertical);
}
