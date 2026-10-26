import { ringInnerRadius, ringOuterRadius } from './exteriorLayout';
import { Vector3 } from 'three';
import {
  canAppearThroughOpenings,
  planetWorldMatrix,
} from './exteriorVisibility';

// Deterministic particles occupy the existing ring envelope, not the room.
export function createRingParticles(count = 6500, visibleOnly = true) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const worldPoint = new Vector3();
  let kept = 0;
  const random = (i: number, salt: number) => {
    const value = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  for (let i = 0; i < count; i++) {
    let r =
      ringInnerRadius +
      0.04 +
      random(i, 1) * (ringOuterRadius - ringInnerRadius - 0.08);
    if (r > 2.86 && r < 3.06) r += 0.21;
    const a = random(i, 2) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = (random(i, 3) - 0.5) * 0.026;
    const z = Math.sin(a) * r;
    if (
      visibleOnly &&
      !canAppearThroughOpenings(
        worldPoint.set(x, y, z).applyMatrix4(planetWorldMatrix),
      )
    )
      continue;
    positions.set([x, y, z], kept * 3);
    sizes[kept] = 0.45 + random(i, 4) ** 5 * 2.8;
    const shade = 0.45 + random(i, 5) * 0.55;
    colors.set([shade, shade * 0.91, shade * 0.73], kept * 3);
    kept++;
  }
  return {
    positions: positions.slice(0, kept * 3),
    sizes: sizes.slice(0, kept),
    colors: colors.slice(0, kept * 3),
  };
}
