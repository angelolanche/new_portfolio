import { sampleWaterRelease } from './waterRelease';
import { spillSettings } from './spillSettings';
import { SphereGeometry, type InstancedMesh, type Object3D } from 'three';
import { TableWaterSimulation } from './tableWater';
import { getDropletPosition } from './dropletMotion';

// Detached tips have an uneven neck and belly, rather than identical spherical beads.
export function createDetachedWaterGeometry() {
  const geometry = new SphereGeometry(1, 12, 10);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const phase = Math.atan2(z, x);
    const profile =
      0.72 + 0.18 * Math.cos(y * Math.PI) + 0.1 * Math.sin(phase * 3 + y * 4);
    positions.setXYZ(
      i,
      x * profile + 0.12 * (1 - y * y) * Math.sin(y * 3),
      y,
      z * profile,
    );
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Reuse one transform to update many copies of the same deformed tip geometry.
export function updateFallingDroplets(
  dropletsMesh: InstancedMesh,
  dropletTransform: Object3D,
  simulation: TableWaterSimulation,
) {
  let visibleDropletCount = 0;
  // Dense, overlapping packets read as a stream at the lip and separate during free fall.
  for (
    let dropletIndex = simulation.droplets.length - 1;
    dropletIndex >= 0 &&
    visibleDropletCount < spillSettings.droplets.maximumVisibleCount;
    dropletIndex--
  ) {
    const drop = simulation.droplets[dropletIndex];
    const age = simulation.time - drop.birthTime;
    // The continuous sheet owns the lip and upper fall. Only a few detached tips
    // become instances below it; do not layer a shower of beads over the sheet.
    const breakupAge =
      0.25 + 0.055 * Math.sin(drop.birthTime * 19 + drop.z * 71);
    if (age < breakupAge || age > spillSettings.droplets.visibleLifetime)
      continue;
    const selection =
      Math.sin(drop.birthTime * 137.3 + drop.z * 241.7) * 43758.5453;
    if (
      selection - Math.floor(selection) >
      spillSettings.droplets.mainScatter +
        spillSettings.droplets.burstScatter *
          sampleWaterRelease(drop.birthTime).burst
    )
      continue;
    const [x, y, z] = getDropletPosition(drop, simulation.time);
    if (y < spillSettings.droplets.minimumVisibleHeight) continue;
    const radius = Math.max(
      spillSettings.droplets.minimumRadius,
      Math.min(
        spillSettings.droplets.maximumRadius,
        Math.cbrt((3 * drop.volume) / (4 * Math.PI)),
      ),
    );
    dropletTransform.position.set(x, y, z);
    dropletTransform.scale.set(
      radius * 0.8,
      radius * (1.8 + age * spillSettings.droplets.verticalStretchRate),
      radius * 0.55,
    );
    dropletTransform.rotation.set(0, 0, -drop.velocityX * 0.25);
    dropletTransform.updateMatrix();
    dropletsMesh.setMatrixAt(visibleDropletCount++, dropletTransform.matrix);
  }
  dropletsMesh.count = visibleDropletCount;
  dropletsMesh.instanceMatrix.needsUpdate = true;
}
