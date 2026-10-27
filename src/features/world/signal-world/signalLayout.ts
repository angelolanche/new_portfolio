export const signalCenterZ = -52.8;
export const signalSunPosition = [0, 90, -125.4] as const;
// Includes the longest corona needles and a visible gap beyond their tips.
export const signalSunClearanceRadius = 26;
export const projectStandOff = 8.5;
export const projectBlockDepth = (index: number) => 0.8 + (index % 4) * 0.45;
