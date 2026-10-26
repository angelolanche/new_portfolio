import { describe, expect, it } from 'vitest';
import { spillSettings } from './spillSettings';
import { glassContactTime } from './spillMotion';
import { sampleWaterRelease } from './waterRelease';

describe('reference release phases', () => {
  it('starts without impulse, peaks around tipping and settles into the main flow', () => {
    expect(sampleWaterRelease(glassContactTime - 0.3).burst).toBe(0);
    expect(sampleWaterRelease(glassContactTime - 0.1).burst).toBeGreaterThan(
      0.8,
    );
    expect(
      sampleWaterRelease(glassContactTime + spillSettings.release.decayTime * 5)
        .burst,
    ).toBeLessThan(0.02);
    expect(
      sampleWaterRelease(glassContactTime + spillSettings.release.decayTime * 5)
        .settled,
    ).toBe(1);
  });
  it('has no jumps at the splash onset or phase change', () => {
    for (const time of [
      glassContactTime - 0.2,
      glassContactTime - 0.13,
      glassContactTime + 0.15,
      glassContactTime + 1,
    ]) {
      const a = sampleWaterRelease(time - 0.00001),
        b = sampleWaterRelease(time + 0.00001);
      expect(Math.abs(a.burst - b.burst)).toBeLessThan(0.001);
      expect(Math.abs(a.settled - b.settled)).toBeLessThan(0.001);
    }
  });
});
