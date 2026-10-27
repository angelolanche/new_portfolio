import { describe, expect, it } from 'vitest';
import { spillSettings } from './spillSettings';
import { TableWaterSimulation } from './tableWater';
import { getDropletPosition } from './dropletMotion';
import {
  initialWaterVolume,
  findWaterSurfaceHeight,
  calculateVolumeBelowHeight,
} from './cupWaterVolume';
import { getGridCellPosition, cellArea } from './waterGrid';
import { glassContactTime, impactTime, spillDuration } from './spillMotion';
import { tableRadius } from '../room/sceneLayout';

describe('gravity driven water', () => {
  it('keeps the initial water inside the upright glass before the bump', () => {
    const simulation = new TableWaterSimulation();
    simulation.advance(impactTime);
    expect(simulation.remainingCupVolume).toBe(initialWaterVolume);
    expect(simulation.surfaceVolume).toBe(0);
    expect(simulation.escapedVolume).toBe(0);
    // The sliced-volume approximation must recover the chosen fill within 1 cm.
    expect(
      Math.abs(
        findWaterSurfaceHeight(initialWaterVolume, 0) -
          spillSettings.water.initialSurfaceHeight,
      ),
    ).toBeLessThan(0.01);
    expect(calculateVolumeBelowHeight(0.1, Math.PI / 2)).toBeGreaterThan(
      calculateVolumeBelowHeight(-0.05, Math.PI / 2),
    );
  });
  it('transfers water from the tilted glass to the table and then beyond its rim without creating volume', () => {
    const simulation = new TableWaterSimulation();
    simulation.advance(glassContactTime + 0.2);
    expect(simulation.dischargedVolume).toBeGreaterThan(0);
    simulation.advance(spillDuration);
    expect(simulation.remainingCupVolume).toBe(0);
    expect(simulation.dischargedVolume).toBeCloseTo(initialWaterVolume, 10);
    expect(simulation.surfaceVolume).toBeGreaterThan(0);
    const wetArea = simulation.waterDepths.reduce(
      (sum, depth) => sum + (depth > 0.00005 ? cellArea : 0),
      0,
    );
    expect(wetArea).toBeLessThan(0.3);
    expect(simulation.escapedVolume).toBeGreaterThan(initialWaterVolume * 0.65);
    expect(
      simulation.remainingCupVolume +
        simulation.surfaceVolume +
        simulation.escapedVolume,
    ).toBeCloseTo(initialWaterVolume, 9);
    for (let i = 0; i < simulation.waterDepths.length; i++) {
      expect(Number.isFinite(simulation.waterDepths[i])).toBe(true);
      expect(simulation.waterDepths[i]).toBeGreaterThanOrEqual(0);
      if (!simulation.wettableCells[i])
        expect(simulation.waterDepths[i]).toBe(0);
    }
    expect(
      simulation.droplets.some(
        (drop) => Math.hypot(drop.x, drop.z) >= tableRadius - 0.001,
      ),
    ).toBe(true);
  });
  it('produces identical results regardless of frame cadence or repeated timestamps', () => {
    const direct = new TableWaterSimulation();
    direct.advance(glassContactTime + 0.7);
    const framed = new TableWaterSimulation();
    for (let t = 0; t < glassContactTime + 0.7; t += 0.071) framed.advance(t);
    framed.advance(glassContactTime + 0.7);
    expect(framed.waterDepths).toEqual(direct.waterDepths);
    const before = framed.waterDepths.slice();
    framed.advance(glassContactTime + 0.7);
    expect(framed.waterDepths).toEqual(before);
  });
  it('accelerates detached droplets downwards and keeps tabletop obstacles dry', () => {
    const drop = {
      x: -0.82,
      y: 0.84,
      z: 0,
      velocityX: -0.2,
      velocityY: 0,
      velocityZ: 0,
      volume: 1e-6,
      birthTime: 2,
    };
    const a = getDropletPosition(drop, 2.1),
      b = getDropletPosition(drop, 2.2),
      c = getDropletPosition(drop, 2.3);
    expect(c[1] - b[1]).toBeLessThan(b[1] - a[1]);
    expect(b[0]).toBeLessThan(a[0]);
    const simulation = new TableWaterSimulation();
    for (let i = 0; i < simulation.wettableCells.length; i++) {
      const [x, z] = getGridCellPosition(i);
      if (x > -0.55 && x < -0.3 && z > -0.3 && z < 0)
        expect(simulation.wettableCells[i]).toBe(0);
    }
  });
});
