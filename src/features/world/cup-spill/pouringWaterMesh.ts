import { spillSettings } from './spillSettings';
import { BufferAttribute, BufferGeometry, type Mesh } from 'three';
import { sampleWaterRelease } from './waterRelease';
import { TableWaterSimulation } from './tableWater';
import { sampleSpillMotion } from './spillMotion';

export function createPouringWaterGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(21 * 10 * 3), 3),
  );
  const indices = [];
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 10; x++) {
      const ringVertex = y * 10 + x,
        nextRingVertex = y * 10 + ((x + 1) % 10);
      indices.push(
        ringVertex,
        ringVertex + 10,
        nextRingVertex,
        nextRingVertex,
        ringVertex + 10,
        nextRingVertex + 10,
      );
    }
  geometry.setIndex(indices);
  return geometry;
}

// Each ring follows the water leaving the rim under gravity.
export function updatePouringWaterMesh(
  streamGeometry: BufferGeometry,
  streamMesh: Mesh,
  simulation: TableWaterSimulation,
  pose: ReturnType<typeof sampleSpillMotion>,
) {
  streamMesh.visible = simulation.dischargeRate > 0.00001;
  const position = streamGeometry.getAttribute('position');
  const horizontalSpeed = simulation.pouringSpeed;
  const { burst: pulse } = sampleWaterRelease(simulation.time);
  const burst = pulse * spillSettings.release.deformation;
  const fallTimeSeconds = Math.sqrt(
    (2 *
      Math.max(
        0.001,
        simulation.pouringOrigin[1] - spillSettings.water.tableSurfaceHeight,
      )) /
      spillSettings.water.gravity,
  );
  for (let ringIndex = 0; ringIndex <= 20; ringIndex++) {
    const age = (ringIndex / 20) * fallTimeSeconds;
    const radius = Math.min(
      0.038,
      Math.sqrt(
        simulation.dischargeRate /
          (Math.PI *
            Math.max(
              0.2,
              Math.hypot(horizontalSpeed, spillSettings.water.gravity * age),
            )),
      ),
    );
    for (let segmentIndex = 0; segmentIndex < 10; segmentIndex++) {
      const phase = (segmentIndex / 10) * Math.PI * 2;
      const downstream = ringIndex / 20;
      const travellingTime = simulation.time - age;
      const lobe =
        1 +
        downstream *
          ((0.04 + 0.45 * burst) *
            Math.sin(phase * 3 + travellingTime * 23 + downstream * 5) +
            (0.025 + 0.2 * burst) * Math.cos(phase * 5 - travellingTime * 17));
      const spread =
        1 + burst * downstream * spillSettings.release.splashSpread;
      const bend =
        (0.001 + burst * 0.012) *
        downstream *
        downstream *
        Math.sin(travellingTime * 19 + downstream * 8);
      position.setXYZ(
        ringIndex * 10 + segmentIndex,
        simulation.pouringOrigin[0] -
          horizontalSpeed * age * Math.cos(pose.yaw) +
          radius * lobe * Math.cos(phase) * (0.3 + 0.2 * burst) +
          bend,
        simulation.pouringOrigin[1] -
          (spillSettings.water.gravity / 2) * age * age +
          radius * lobe * Math.cos(phase) * (0.25 + 0.25 * burst),
        simulation.pouringOrigin[2] +
          horizontalSpeed * age * Math.sin(pose.yaw) +
          radius * lobe * spread * Math.sin(phase),
      );
    }
  }
  position.needsUpdate = true;
  streamGeometry.computeVertexNormals();
  streamGeometry.computeBoundingSphere();
}
