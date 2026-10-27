import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultSpillSettings, spillSettings } from './spillSettings';
import { initialWaterVolume } from './cupWaterVolume';
import { glassContactTime, sampleSpillMotion } from './spillMotion';
import { WaterMaterial } from './WaterMaterial';

vi.mock('../surfaces/roomSurfaceContext', () => ({
  useRoomReflection: () => undefined,
}));

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
    settings.appearance.puddleOpacity = 0.7;
    Object.assign(spillSettings.appearance, settings.appearance);
    expect(WaterMaterial({ puddle: true, surface: true }).props).toMatchObject({
      color: '#abcdef',
      roughness: 0.1,
      opacity: 0.7,
      vertexColors: true,
      depthWrite: false,
    });
    expect(WaterMaterial({}).props).toEqual(fallingBefore);
    expect(initialWaterVolume).toBe(volumeBefore);
    expect(sampleSpillMotion(glassContactTime + 1)).toEqual(motionBefore);
  });
  it('keeps refraction inside the cup while thin water uses the room reflection model', () => {
    expect(WaterMaterial({ volume: true }).type).toBe('meshPhysicalMaterial');
    expect(WaterMaterial({ volume: true }).props.transmission).toBeGreaterThan(
      0,
    );
    for (const options of [
      {},
      { surface: true },
      { surface: true, puddle: true },
    ]) {
      const material = WaterMaterial(options);
      expect(material.type).toBe('meshStandardMaterial');
      expect(material.props).toMatchObject({
        forceSinglePass: true,
        transparent: true,
      });
      expect(material.props).not.toHaveProperty('transmission');
    }
  });
});
