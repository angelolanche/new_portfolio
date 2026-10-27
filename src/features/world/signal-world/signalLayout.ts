export const signalCenterZ = -52.8;
export const signalSunPosition = [0, 90, -125.4] as const;
// End the lead below the final camera framing, before the sun and its instructions.
export const signalSunClearanceRadius = 65;
export const projectStandOff = 8.5;
export const projectBlockDepth = (index: number) => 0.8 + (index % 4) * 0.45;
