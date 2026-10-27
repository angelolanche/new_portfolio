import { spillSettings } from './spillSettings';
import { BufferAttribute, BufferGeometry } from 'three';
import { glassPosition, tableRadius } from '../room/sceneLayout';
import { TableWaterSimulation } from './tableWater';
import { sampleWaterRelease } from './waterRelease';

const smooth = (low: number, high: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
};
// Smooth, deterministic noise travels with the water. No per-frame randomness:
// each timestamp keeps the same folds, thinning edges and tears.
function sheetNoise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const hash = (a: number, b: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const u = smooth(0, 1, x - ix),
    v = smooth(0, 1, y - iy);
  return (
    (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) +
    (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v
  );
}

export function createEdgeCascadeGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(25 * 18 * 3), 3),
  );
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(25 * 18 * 4), 4),
  );
  const indices = [];
  for (let y = 0; y < 17; y++)
    for (let x = 0; x < 24; x++) {
      const vertexIndex = y * 25 + x;
      indices.push(
        vertexIndex,
        vertexIndex + 25,
        vertexIndex + 1,
        vertexIndex + 1,
        vertexIndex + 25,
        vertexIndex + 26,
      );
    }
  geometry.setIndex(indices);
  return geometry;
}

// A thin sheet follows the conserved rim flow; detached drops are not rendered.
export function updateEdgeCascadeMesh(
  cascadeGeometry: BufferGeometry,
  simulation: TableWaterSimulation,
) {
  const cascadePosition = cascadeGeometry.getAttribute('position');
  const cascadeColor = cascadeGeometry.getAttribute('color');
  // Shape follows measured rim flow: lower flow produces a narrower, shorter sheet.
  const fallbackAngle = Math.atan2(glassPosition[2], -tableRadius);
  let totalRate = 0,
    weightedAngle = 0;
  const recent = simulation.droplets.filter(
    (drop) => simulation.time - drop.birthTime <= 0.6,
  );
  const angleOf = (x: number, z: number) => {
    const angle = Math.atan2(z, x);
    return angle < 0 ? angle + 2 * Math.PI : angle;
  };
  for (const drop of recent)
    if (simulation.time - drop.birthTime <= 0.1) {
      const rate = drop.volume / 0.1;
      totalRate += rate;
      weightedAngle += angleOf(drop.x, drop.z) * rate;
    }
  const centerAngle = totalRate > 0 ? weightedAngle / totalRate : fallbackAngle;
  const strength = totalRate / (totalRate + 0.0003);
  const { burst, settled } = sampleWaterRelease(simulation.time);
  const coherence = Math.min(
    1,
    (strength * (0.9 - 0.65 * burst) + settled * 0.4) *
      spillSettings.cascade.cohesion,
  );
  const halfWidth =
    (0.025 + 0.305 * Math.sqrt(strength)) *
    (1 + 0.3 * burst - 0.35 * settled) *
    spillSettings.cascade.widthScale;
  const sheetFlightTime =
    (0.09 + 0.32 * Math.sqrt(strength)) * spillSettings.cascade.lengthScale;
  for (let row = 0; row < 18; row++) {
    const age = (row / 17) * sheetFlightTime;
    const edgeRates = new Float64Array(25);
    // Lower vertices represent earlier emissions, so the sheet does not change all at once.
    for (const drop of recent) {
      const elapsed = simulation.time - age - drop.birthTime;
      if (elapsed < 0 || elapsed > 0.1) continue;
      const index = Math.round(
        ((angleOf(drop.x, drop.z) - centerAngle + halfWidth) /
          (2 * halfWidth)) *
          24,
      );
      if (index >= 0 && index < 25) edgeRates[index] += drop.volume / 0.1;
    }
    for (let column = 0; column < 25; column++) {
      const u = (column / 24) * 2 - 1;
      const v = row / 17;
      const emittedAt = simulation.time - age;
      const fold = sheetNoise(u * 3.3 + 8, emittedAt * 1.7);
      const detail = sheetNoise(u * 8.2 + 17, emittedAt * 3.1 - v * 2);
      const skew =
        (sheetNoise(v * 2.7 + 31, emittedAt * 1.3) - 0.5) *
        v *
        spillSettings.cascade.deformation;
      const angleAroundTable =
        centerAngle +
        halfWidth *
          (u * (1 - (0.3 + 0.2 * settled) * v) + skew * (0.22 + 0.5 * burst));
      // Strong flow joins adjacent lanes into a sheet. Thin flow separates into rivulets.
      let dischargeRate = 0,
        weights = 0;
      const kernelRadius = coherence > 0.55 ? 3 : 1;
      for (let lane = -kernelRadius; lane <= kernelRadius; lane++) {
        const index = column + lane;
        if (index < 0 || index >= 25) continue;
        const weight = kernelRadius + 1 - Math.abs(lane);
        dischargeRate += edgeRates[index] * weight;
        weights += weight;
      }
      dischargeRate = (dischargeRate / weights) * 2;
      const flightAge = age * (0.82 + 0.3 * fold);
      const ripple =
        (0.002 + 0.018 * burst + 0.003 * (1 - coherence)) *
        strength *
        (detail - 0.5) *
        v *
        spillSettings.cascade.deformation;
      const distanceFromTableCenter =
        tableRadius +
        (0.04 + 0.1 * strength + 0.65 * burst) *
          flightAge *
          (0.65 + 0.7 * fold) +
        ripple +
        0.015 * settled * strength * Math.sqrt(Math.max(0, 1 - u * u)) * v;
      const vertexIndex = row * 25 + column;
      cascadePosition.setXYZ(
        vertexIndex,
        Math.cos(angleAroundTable) * distanceFromTableCenter,
        spillSettings.water.tableSurfaceHeight -
          0.04 * flightAge -
          (spillSettings.water.gravity / 2) * flightAge * flightAge,
        Math.sin(angleAroundTable) * distanceFromTableCenter,
      );
      // The opening splash is broken; the main flow gathers into a continuous, folded body.
      const tearField = 0.65 * detail + 0.35 * fold + (1 - v) * 0.65;
      const tearThreshold = 0.34 + 0.25 * (1 - coherence);
      const holes =
        coherence > 0.55
          ? 1
          : smooth(tearThreshold - 0.06, tearThreshold + 0.06, tearField);
      const edge = smooth(
        0,
        0.13,
        1 - Math.abs(u) - (detail - 0.35) * 0.22 * v,
      );
      const end =
        (coherence > 0.55 ? 0.9 : 0.6) + (coherence > 0.55 ? 0.1 : 0.4) * fold;
      const tail = 1 - smooth(end - 0.18, end, v);
      cascadeColor.setXYZW(
        vertexIndex,
        1,
        1,
        1,
        ((0.9 * dischargeRate) / (dischargeRate + 0.00008)) *
          holes *
          edge *
          tail,
      );
    }
  }

  cascadePosition.needsUpdate = true;
  cascadeColor.needsUpdate = true;
  cascadeGeometry.computeVertexNormals();
  cascadeGeometry.computeBoundingSphere();
}
