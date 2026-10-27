import { sampleWaterRelease } from './waterRelease';
import { spillSettings } from './spillSettings';
import { glassPosition, tableRadius } from '../room/sceneLayout';
import {
  sampleSpillMotion,
  simulationStepSeconds,
  spillDuration,
  impactTime,
} from './spillMotion';

import { initialWaterVolume, findWaterSurfaceHeight } from './cupWaterVolume';
import { waterGrid, cellArea, getGridCellPosition } from './waterGrid';
import { type WaterDrop } from './dropletMotion';

export class TableWaterSimulation {
  time = 0;
  remainingCupVolume = initialWaterVolume;
  dischargedVolume = 0;
  escapedVolume = 0;
  waterSurfaceHeight =
    spillSettings.water.initialSurfaceHeight * spillSettings.cup.heightScale;
  dischargeRate = 0;
  pouringSpeed = 0;
  pouringOrigin = [glassPosition[0], 1.25, glassPosition[2]];
  readonly waterDepths = new Float64Array(waterGrid.columns * waterGrid.rows);
  readonly wettableCells = new Uint8Array(this.waterDepths.length);
  readonly droplets: WaterDrop[] = [];
  private readonly recentDropletsByLocation = new Map<string, WaterDrop>();
  private readonly edges: {
    cellIndex: number;
    neighborIndex: number;
    cellOutsideTable: boolean;
    neighborOutsideTable: boolean;
    flux: number;
  }[] = [];
  private readonly volumeChanges = new Float64Array(this.waterDepths.length);
  private readonly outgoingVolumes = new Float64Array(this.waterDepths.length);
  constructor() {
    for (
      let cellIndex = 0;
      cellIndex < this.wettableCells.length;
      cellIndex++
    ) {
      const [x, z] = getGridCellPosition(cellIndex);
      // Block only the actual rotated footprints, not the exposed wood between objects.
      const notebookX =
        Math.cos(-0.12) * (x + 0.4) - Math.sin(-0.12) * (z + 0.18);
      const notebookZ =
        Math.sin(-0.12) * (x + 0.4) + Math.cos(-0.12) * (z + 0.18);
      const penAlong =
        (x + 0.17) * Math.sin(0.14) + (z + 0.18) * Math.cos(0.14);
      const penAcross =
        (x + 0.17) * Math.cos(0.14) - (z + 0.18) * Math.sin(0.14);
      const phoneX = Math.cos(-0.2) * (x - 0.22) - Math.sin(-0.2) * (z + 0.12);
      const phoneZ = Math.sin(-0.2) * (x - 0.22) + Math.cos(-0.2) * (z + 0.12);
      const blocked =
        (Math.abs(notebookX) < 0.176 && Math.abs(notebookZ) < 0.216) ||
        (Math.abs(penAlong) < 0.145 && Math.abs(penAcross) < 0.011) ||
        (Math.abs(phoneX) < 0.245 && Math.abs(phoneZ) < 0.185) ||
        Math.hypot(x - 0.3, z + 0.55) < 0.18;
      this.wettableCells[cellIndex] =
        Math.hypot(x, z) <= tableRadius && !blocked ? 1 : 0;
    }
    for (let row = 0; row < waterGrid.rows; row++)
      for (let column = 0; column < waterGrid.columns; column++) {
        const cellIndex = row * waterGrid.columns + column;
        for (const offset of [
          column < waterGrid.columns - 1 ? 1 : 0,
          row < waterGrid.rows - 1 ? waterGrid.columns : 0,
        ]) {
          if (!offset) continue;
          const neighborIndex = cellIndex + offset;
          const [cellX, cellZ] = getGridCellPosition(cellIndex),
            [neighborX, neighborZ] = getGridCellPosition(neighborIndex);
          const cellOutsideTable = Math.hypot(cellX, cellZ) > tableRadius,
            neighborOutsideTable =
              Math.hypot(neighborX, neighborZ) > tableRadius;
          if (
            (!this.wettableCells[cellIndex] && !cellOutsideTable) ||
            (!this.wettableCells[neighborIndex] && !neighborOutsideTable) ||
            (cellOutsideTable && neighborOutsideTable)
          )
            continue;
          this.edges.push({
            cellIndex,
            neighborIndex,
            cellOutsideTable,
            neighborOutsideTable,
            flux: 0,
          });
        }
      }
  }
  advance(seconds: number) {
    const targetStep = Math.floor(
      Math.max(0, Math.min(spillDuration, seconds)) / simulationStepSeconds,
    );
    if (targetStep < Math.round(this.time / simulationStepSeconds))
      this.reset();
    while (Math.round(this.time / simulationStepSeconds) < targetStep) {
      this.time =
        (Math.round(this.time / simulationStepSeconds) + 1) *
        simulationStepSeconds;
      this.stepSimulation();
    }
  }
  private reset() {
    this.time = 0;
    this.remainingCupVolume = initialWaterVolume;
    this.dischargedVolume = 0;
    this.escapedVolume = 0;
    this.waterDepths.fill(0);
    for (const edge of this.edges) edge.flux = 0;
    this.droplets.length = 0;
    this.recentDropletsByLocation.clear();
    this.dischargeRate = 0;
    this.pouringSpeed = 0;
    this.waterSurfaceHeight =
      spillSettings.water.initialSurfaceHeight * spillSettings.cup.heightScale;
  }
  private stepSimulation() {
    if (this.time <= impactTime) return;
    const pose = sampleSpillMotion(this.time);
    // Negative tilt angles use the symmetric capacity of a circular glass.
    this.waterSurfaceHeight = findWaterSurfaceHeight(
      this.remainingCupVolume,
      pose.angle,
    );
    const lowestRimHeight =
      0.412 * spillSettings.cup.heightScale * Math.cos(pose.angle) -
      0.094 * spillSettings.cup.radiusScale * Math.abs(Math.sin(pose.angle));
    const waterHeightAboveRim = Math.max(
      0,
      this.waterSurfaceHeight - lowestRimHeight,
    );
    const release = sampleWaterRelease(this.time);
    this.pouringSpeed =
      Math.sqrt(2 * spillSettings.water.gravity * waterHeightAboveRim) *
        spillSettings.water.horizontalPourSpeedFactor +
      release.extraSpeed;
    this.dischargeRate = Math.min(
      this.remainingCupVolume / simulationStepSeconds,
      spillSettings.water.outletArea *
        (1 + spillSettings.release.dischargeBoost * release.burst) *
        Math.sqrt(2 * spillSettings.water.gravity * waterHeightAboveRim),
    );
    // The final thin film keeps dripping as the rolling cup wets its lip.
    // Feed it into the same conserved flow rather than hiding residual water at the hold.
    if (pose.spin > 0 && this.remainingCupVolume < initialWaterVolume * 0.02) {
      this.dischargeRate = Math.max(
        this.dischargeRate,
        Math.min(
          this.remainingCupVolume / simulationStepSeconds,
          initialWaterVolume * 0.015,
        ),
      );
    }
    if (this.remainingCupVolume < initialWaterVolume * 0.0001)
      this.dischargeRate = this.remainingCupVolume / simulationStepSeconds;
    const volume = this.dischargeRate * simulationStepSeconds;
    this.remainingCupVolume -= volume;
    this.dischargedVolume += volume;
    this.pouringOrigin = [
      pose.x -
        (0.412 * spillSettings.cup.heightScale * Math.sin(pose.angle) +
          0.094 * spillSettings.cup.radiusScale * Math.cos(pose.angle)) *
          Math.cos(pose.yaw),
      glassPosition[1] + pose.lift + lowestRimHeight,
      pose.z +
        (0.412 * spillSettings.cup.heightScale * Math.sin(pose.angle) +
          0.094 * spillSettings.cup.radiusScale * Math.cos(pose.angle)) *
          Math.sin(pose.yaw),
    ];
    if (volume > 0) {
      // Torricelli discharge feeds the table at the ballistic landing point.
      const fallTimeSeconds = Math.sqrt(
        (2 *
          Math.max(
            0,
            this.pouringOrigin[1] - spillSettings.water.tableSurfaceHeight,
          )) /
          spillSettings.water.gravity,
      );
      const landingX =
        this.pouringOrigin[0] -
        this.pouringSpeed * fallTimeSeconds * Math.cos(pose.yaw);
      const landingZ =
        this.pouringOrigin[2] +
        this.pouringSpeed * fallTimeSeconds * Math.sin(pose.yaw);
      const column = Math.round((landingX - waterGrid.x) / waterGrid.spacing);
      const row = Math.round((landingZ - waterGrid.z) / waterGrid.spacing);
      const index = row * waterGrid.columns + column;
      if (
        index >= 0 &&
        index < this.waterDepths.length &&
        this.wettableCells[index]
      )
        this.waterDepths[index] += volume / cellArea;
      else {
        const radius = Math.hypot(landingX, landingZ);
        const outside = radius > tableRadius;
        this.emitEscapedWater(
          outside ? (landingX * tableRadius) / radius : this.pouringOrigin[0],
          outside ? (landingZ * tableRadius) / radius : this.pouringOrigin[2],
          volume,
          this.pouringSpeed,
        );
      }
    }
    if (this.dischargedVolume > 0) this.advanceTabletopFlow();
  }
  private advanceTabletopFlow() {
    const spacing = waterGrid.spacing;
    this.volumeChanges.fill(0);
    this.outgoingVolumes.fill(0);
    // Staggered finite-volume fluxes retain momentum and conserve mass. Positivity is
    // enforced jointly across all outgoing edges, rather than clamping away lost water.
    for (const edge of this.edges) {
      const {
        cellIndex,
        neighborIndex,
        cellOutsideTable,
        neighborOutsideTable,
      } = edge;
      const cellDepth = this.waterDepths[cellIndex],
        neighborDepth = this.waterDepths[neighborIndex];
      const depth = Math.max(cellDepth, neighborDepth);
      const heightDifference =
        (cellOutsideTable ? -0.025 : cellDepth) -
        (neighborOutsideTable ? -0.025 : neighborDepth);
      const drivingHeight =
        Math.sign(heightDifference) *
        Math.max(
          0,
          Math.abs(heightDifference) - spillSettings.water.surfacePinningDepth,
        );
      edge.flux =
        (edge.flux +
          ((spillSettings.water.gravity * depth * drivingHeight) / spacing) *
            simulationStepSeconds) *
        spillSettings.water.surfaceMomentumRetention;
      const sourceIndex = edge.flux >= 0 ? cellIndex : neighborIndex;
      if (
        this.waterDepths[sourceIndex] <= 0 ||
        !this.wettableCells[sourceIndex]
      )
        edge.flux = 0;
      this.outgoingVolumes[sourceIndex] +=
        Math.abs(edge.flux) * simulationStepSeconds * spacing;
    }
    for (const edge of this.edges) {
      if (edge.flux === 0) continue;
      const sourceIndex = edge.flux > 0 ? edge.cellIndex : edge.neighborIndex,
        destinationIndex = edge.flux > 0 ? edge.neighborIndex : edge.cellIndex;
      const availableVolumeFraction = Math.min(
        1,
        (this.waterDepths[sourceIndex] * cellArea) /
          Math.max(this.outgoingVolumes[sourceIndex], 1e-16),
      );
      const volume =
        Math.abs(edge.flux) *
        simulationStepSeconds *
        spacing *
        availableVolumeFraction;
      this.volumeChanges[sourceIndex] -= volume;
      if (this.wettableCells[destinationIndex])
        this.volumeChanges[destinationIndex] += volume;
      else {
        const [x, z] = getGridCellPosition(sourceIndex);
        const radial = tableRadius / Math.hypot(x, z);
        this.emitEscapedWater(
          x * radial,
          z * radial,
          volume,
          Math.min(
            0.65,
            Math.abs(edge.flux) / Math.max(this.waterDepths[sourceIndex], 1e-5),
          ),
        );
      }
    }
    for (let cellIndex = 0; cellIndex < this.waterDepths.length; cellIndex++)
      this.waterDepths[cellIndex] = Math.max(
        0,
        this.waterDepths[cellIndex] + this.volumeChanges[cellIndex] / cellArea,
      );
  }
  private emitEscapedWater(
    x: number,
    z: number,
    volume: number,
    speed: number,
  ) {
    this.escapedVolume += volume;
    const key = Math.round(x / 0.035) + ':' + Math.round(z / 0.035);
    const recent = this.recentDropletsByLocation.get(key);
    if (recent && this.time - recent.birthTime < 1 / 45) {
      recent.volume += volume;
      return;
    }
    if (volume < 1e-10) return;
    const radial = Math.hypot(x, z);
    const drop = {
      x,
      y: spillSettings.water.tableSurfaceHeight,
      z,
      velocityX: (speed * x) / radial,
      velocityY: -0.04,
      velocityZ: (speed * z) / radial,
      volume,
      birthTime: this.time,
    };
    this.recentDropletsByLocation.set(key, drop);
    this.droplets.push(drop);
  }
  get surfaceVolume() {
    return this.waterDepths.reduce((sum, depth) => sum + depth * cellArea, 0);
  }
}
