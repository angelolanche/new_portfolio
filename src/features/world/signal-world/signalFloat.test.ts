import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { floatPeriod, sampleFloat, videoFloatAmplitude } from './signalFloat';

it('keeps videos near their anchors and returns translation and tilt to the original pose each cycle', () => {
  const position = new Vector3(),
    rotation = new Vector3();
  for (let seed = 0; seed < 146; seed++) {
    sampleFloat(0, seed, videoFloatAmplitude, position, rotation);
    expect(position.length()).toBe(0);
    expect(rotation.length()).toBe(0);
    let travel = 0;
    for (let frame = 0; frame < 90; frame++) {
      sampleFloat(
        (floatPeriod(seed) * frame) / 90,
        seed,
        videoFloatAmplitude,
        position,
        rotation,
      );
      travel = Math.max(travel, position.length());
      if (
        position.length() > videoFloatAmplitude * 1.93 ||
        rotation.length() > 0.1
      )
        throw new Error(`Unbounded floating pose: ${seed}`);
    }
    expect(travel).toBeGreaterThan(0.1);
    sampleFloat(
      floatPeriod(seed),
      seed,
      videoFloatAmplitude,
      position,
      rotation,
    );
    expect(position.length()).toBeLessThan(1e-12);
    expect(rotation.length()).toBeLessThan(1e-12);
  }
});
