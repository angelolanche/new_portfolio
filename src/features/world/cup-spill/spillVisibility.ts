import { Box3, Frustum, Matrix4, type Camera } from 'three';
import { glassPosition, tableRadius } from '../room/sceneLayout';
import { spillSettings } from './spillSettings';
import { sampleWaterRelease } from './waterRelease';
import type { sampleSpillMotion } from './spillMotion';
import type { TableWaterSimulation } from './tableWater';

export type SpillPart = 'cup' | 'surface' | 'stream' | 'cascade';

// Envelopes bound the CURRENT simulation without rebuilding any render geometry.
// They include both faces/transparent vertices and a 5 cm safety margin. Never
// infer visibility from a previous frame's mesh bounds or a fixed camera time.
export function createSpillVisibility() {
  const frustum = new Frustum();
  const projection = new Matrix4();
  const worldBounds = new Box3();
  const bounds: Record<SpillPart, Box3> = {
    cup: new Box3(),
    surface: new Box3(),
    stream: new Box3(),
    cascade: new Box3(),
  };
  const visible = { cup: true, surface: true, stream: true, cascade: true };
  return {
    bounds,
    sample(
      camera: Camera,
      matrixWorld: Matrix4,
      simulation: TableWaterSimulation,
      pose: ReturnType<typeof sampleSpillMotion>,
    ) {
      const { cup, water, release, cascade } = spillSettings;
      const cupRadius = Math.hypot(
        0.418 * cup.heightScale + 0.003,
        0.109 * cup.radiusScale,
      );
      bounds.cup.min.set(pose.x, glassPosition[1] + pose.lift, pose.z);
      bounds.cup.max.copy(bounds.cup.min);
      bounds.cup.expandByScalar(cupRadius);

      let maxDepth = 0;
      for (const depth of simulation.waterDepths)
        maxDepth = Math.max(maxDepth, depth);
      bounds.surface.min.set(
        -tableRadius,
        water.puddleBaseHeight,
        -tableRadius,
      );
      bounds.surface.max.set(
        tableRadius,
        water.puddleBaseHeight + maxDepth,
        tableRadius,
      );

      const burst =
        sampleWaterRelease(simulation.time).burst * release.deformation;
      const fallTime = Math.sqrt(
        (2 *
          Math.max(
            0.001,
            simulation.pouringOrigin[1] - water.tableSurfaceHeight,
          )) /
          water.gravity,
      );
      const lobe = 1.065 + 0.65 * burst;
      const cross = 0.038 * lobe;
      const travel = simulation.pouringSpeed * fallTime;
      const xPadding =
        travel + cross * (0.3 + 0.2 * burst) + 0.001 + burst * 0.012;
      const zPadding = travel + cross * (1 + burst * release.splashSpread);
      const yPadding = cross * (0.25 + 0.25 * burst);
      const [x, y, z] = simulation.pouringOrigin;
      bounds.stream.min.set(
        x - xPadding,
        y - (water.gravity / 2) * fallTime ** 2 - yPadding,
        z - zPadding,
      );
      bounds.stream.max.set(x + xPadding, y + yPadding, z + zPadding);

      // strength, burst, settled and noise stay in [0, 1]. This includes the
      // maximum radial ripple and flight time of every vertex of the sheet.
      const flightTime = 0.41 * cascade.lengthScale * 1.12;
      const radius =
        tableRadius +
        0.79 * flightTime +
        0.023 * 0.5 * cascade.deformation +
        0.015 * flightTime;
      bounds.cascade.min.set(
        -radius,
        water.tableSurfaceHeight -
          0.04 * flightTime -
          (water.gravity / 2) * flightTime ** 2,
        -radius,
      );
      bounds.cascade.max.set(radius, water.tableSurfaceHeight, radius);

      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(
        projection.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      for (const part of Object.keys(bounds) as SpillPart[]) {
        bounds[part].expandByScalar(0.05);
        worldBounds.copy(bounds[part]).applyMatrix4(matrixWorld);
        visible[part] = frustum.intersectsBox(worldBounds);
      }
      return visible;
    },
  };
}
