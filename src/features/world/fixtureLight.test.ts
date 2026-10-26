import { describe, expect, it } from 'vitest';
import { sampleFixtureIntensity } from './fixtureLight';

describe('faulty chandelier bulb', () => {
  it('cuts abruptly for only 50?90 ms before recovering', () => {
    expect(sampleFixtureIntensity(1.84)).toBeGreaterThan(0.9);
    expect(sampleFixtureIntensity(1.86)).toBeLessThan(0.02);
    for (const time of [6.11, 6.14, 6.18])
      expect(sampleFixtureIntensity(time)).toBe(0);
    expect(sampleFixtureIntensity(6.2)).toBeGreaterThan(0.9);
  });
  it('never leaves the bulb dark for more than 90 ms', () => {
    let consecutiveDark = 0;
    for (let i = 0; i < 14500; i++) {
      consecutiveDark =
        sampleFixtureIntensity(i / 1000) < 0.5 ? consecutiveDark + 1 : 0;
      expect(consecutiveDark).toBeLessThanOrEqual(90);
    }
  });
  it('stays mostly on and reproduces the same light level on pause/replay', () => {
    let darkSamples = 0;
    for (let i = 0; i < 1450; i++) {
      const value = sampleFixtureIntensity(i / 100);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      expect(sampleFixtureIntensity(i / 100)).toBe(value);
      if (value < 0.5) darkSamples++;
    }
    expect(darkSamples / 1450).toBeLessThan(0.03);
  });
});
