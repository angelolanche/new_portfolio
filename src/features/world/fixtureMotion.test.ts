import { expect, it } from 'vitest';
import { impactTime } from './cup-spill/spillMotion';
import { sampleFixtureSwing } from './fixtureMotion';

it('starts at the table impact and settles without moving the ceiling mount', () => {
  for (const time of [0, impactTime - 0.01, impactTime])
    expect(sampleFixtureSwing(time)).toBe(0);
  expect(Math.abs(sampleFixtureSwing(impactTime + 0.2))).toBeGreaterThan(0.04);
  expect(sampleFixtureSwing(impactTime + 0.7)).toBeLessThan(0);
  expect(Math.abs(sampleFixtureSwing(impactTime + 6))).toBeLessThan(0.001);
});

it('is bounded and deterministic when paused or replayed', () => {
  for (let time = 0; time < 14.5; time += 0.05) {
    const angle = sampleFixtureSwing(time);
    expect(Math.abs(angle)).toBeLessThan(0.13);
    expect(sampleFixtureSwing(time)).toBe(angle);
  }
});
