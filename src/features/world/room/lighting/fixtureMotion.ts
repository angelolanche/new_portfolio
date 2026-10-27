import { impactTime, sampleSpillMotion } from '../../cup-spill/spillMotion';

// The mount stays fixed. The hanging stem, arms, bulb and light swing together.
export function sampleFixtureSwing(seconds: number): number {
  const age = seconds - impactTime;
  if (age <= 0) return 0;
  return (
    sampleSpillMotion(seconds).jolt * 0.8 +
    0.095 * Math.sin(age * 7) * Math.exp(-age * 1.1)
  );
}
