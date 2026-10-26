import { afterEach, describe, expect, it } from 'vitest';
import { defaultSpillSettings, spillSettings } from './spillSettings';
import { initialWaterVolume } from './cupWaterVolume';
import { glassContactTime, sampleSpillMotion } from './spillMotion';
import { WaterMaterial } from './WaterMaterial';

afterEach(() =>
  Object.assign(spillSettings.appearance, defaultSpillSettings.appearance),
);
describe('independent tabletop water material', () => {
  it('adjusts only the tabletop material without altering falling water, volume or choreography', () => {
    const fallingBefore = WaterMaterial({}).props;
    const volumeBefore = initialWaterVolume;
    const motionBefore = sampleSpillMotion(glassContactTime + 1);
    const settings = structuredClone(defaultSpillSettings);
    settings.appearance.puddleColor = '#abcdef';
    settings.appearance.puddleRoughness = 0.1;
    settings.appearance.puddleTransmission = 0.8;
    settings.appearance.puddleOpacity = 0.7;
    settings.appearance.puddleThickness = 0.03;
    settings.appearance.puddleClearcoat = 0.6;
    settings.appearance.puddleClearcoatRoughness = 0.2;
    Object.assign(spillSettings.appearance, settings.appearance);
    expect(WaterMaterial({ puddle: true, surface: true }).props).toMatchObject({
      color: '#abcdef',
      roughness: 0.1,
      transmission: 0.8,
      opacity: 0.7,
      thickness: 0.03,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      vertexColors: true,
      depthWrite: false,
    });
    expect(WaterMaterial({}).props).toEqual(fallingBefore);
    expect(initialWaterVolume).toBe(volumeBefore);
    expect(sampleSpillMotion(glassContactTime + 1)).toEqual(motionBefore);
  });
});
