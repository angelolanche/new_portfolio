import type { Vector3 } from 'three';

export const videoFloatAmplitude = 0.38;
export const floatPeriod = (seed: number) => 24 + (seed % 5) * 4;

/** Bounded, periodic offsets: no accumulated drift, and a deterministic origin. */
export function sampleFloat(
  time: number,
  seed: number,
  amplitude: number,
  position: Vector3,
  rotation: Vector3,
) {
  const t = (time * Math.PI * 2) / floatPeriod(seed);
  const phase = seed * 1.73;
  const wave = (frequency: number, offset: number) =>
    Math.sin(t * frequency + offset) - Math.sin(offset);
  position.set(
    amplitude * 0.55 * wave(1, phase),
    amplitude * 0.65 * wave(2, phase * 0.7),
    amplitude * 0.4 * wave(1, -phase),
  );
  rotation.set(
    0.025 * wave(1, phase),
    0.035 * wave(1, phase + 1),
    0.02 * wave(2, -phase),
  );
}
