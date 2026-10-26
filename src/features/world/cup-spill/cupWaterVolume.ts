import { spillSettings } from './spillSettings';
export const liquidHeight = 0.4 * spillSettings.cup.heightScale;
export const liquidBottom = 0.012 * spillSettings.cup.heightScale;
export const getCupInnerRadius = (sliceHeight: number) =>
  (0.079 + 0.015 * (sliceHeight / liquidHeight)) *
  spillSettings.cup.radiusScale;
const integrationSliceCount = 36;
// Circular segment area integrated along the glass axis. The free surface is horizontal,
// not attached to the tumbler: gravity determines its orientation even while the glass tips.
export function calculateVolumeBelowHeight(
  waterSurfaceHeight: number,
  angle: number,
) {
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);
  let volume = 0;
  for (let sliceIndex = 0; sliceIndex < integrationSliceCount; sliceIndex++) {
    const sliceHeight =
      liquidBottom +
      ((sliceIndex + 0.5) * liquidHeight) / integrationSliceCount;
    const sliceRadius = getCupInnerRadius(sliceHeight);
    const horizontalCutPosition =
      (waterSurfaceHeight - sliceHeight * cosine) /
      (Math.abs(sine) < 1e-6 ? 1e-6 : Math.abs(sine));
    const normalizedCutPosition = Math.max(
      -1,
      Math.min(1, horizontalCutPosition / sliceRadius),
    );
    const area =
      sliceRadius *
      sliceRadius *
      (Math.acos(-normalizedCutPosition) +
        normalizedCutPosition *
          Math.sqrt(
            Math.max(0, 1 - normalizedCutPosition * normalizedCutPosition),
          ));
    volume += (area * liquidHeight) / integrationSliceCount;
  }
  return volume;
}
export const initialWaterVolume = calculateVolumeBelowHeight(
  spillSettings.water.initialSurfaceHeight * spillSettings.cup.heightScale,
  0,
);
export function findWaterSurfaceHeight(volume: number, angle: number) {
  let lowerHeight = -0.11 * spillSettings.cup.radiusScale;
  let upperHeight = 0.44 * spillSettings.cup.heightScale;
  for (let sliceIndex = 0; sliceIndex < 17; sliceIndex++) {
    const candidateHeight = (lowerHeight + upperHeight) / 2;
    if (calculateVolumeBelowHeight(candidateHeight, angle) > volume)
      upperHeight = candidateHeight;
    else lowerHeight = candidateHeight;
  }
  return (lowerHeight + upperHeight) / 2;
}
