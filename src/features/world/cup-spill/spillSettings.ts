// Physics: owner-selected export (2026-10-21). Simpler water appearance: 2026-10-27.
// Distances are meters, time is seconds, angles are radians. Edit approved defaults here; no runtime tuning panel.
export const defaultSpillSettings = {
  cup: {
    heightScale: 1,
    radiusScale: 1,
  },
  appearance: {
    waterColor: '#ecebf4',
    waterRoughness: 0.22,
    waterTransmission: 0.55,
    waterOpacity: 0.5,
    puddleRoughness: 0.24,
    puddleColor: '#ecebf4',
    puddleOpacity: 0.32,
    glassOpacity: 0.13,
    glassRoughness: 0.08,
  },
  timing: {
    impactAfterStart: 2.2,
    actionDuration: 10,
    simulationStep: 0.008333333333333333,
  },
  motion: {
    initialAngularVelocity: -1.55,
    secondImpulseDelay: 0.12,
    secondAngularImpulse: 2.2,
    bounceDuration: 0.4,
    bounceAngle: 0.025,
    joltDuration: 0.7,
    joltDistance: 0.02,
    joltFrequency: 65,
    joltDamping: 4,
    rollDistance: 0.1,
    rollDuration: 2,
    sloshAngle: 0.07,
    sloshFrequency: 17,
    sloshDamping: 2.5,
  },
  water: {
    gravity: 6.8,
    initialSurfaceHeight: 0.21,
    outletArea: 0.002,
    surfacePinningDepth: 0.0005,
    horizontalPourSpeedFactor: 0.3,
    surfaceMomentumRetention: 0.96,
    tableSurfaceHeight: 0.845,
    puddleBaseHeight: 0.842,
  },
  release: {
    burstLead: 0.26,
    riseTime: 0.08,
    decayTime: 1,
    extraSpeed: 1.05,
    dischargeBoost: 1.1,
    splashSpread: 6,
    deformation: 2,
    settleDelay: 0.35,
    settleDuration: 0.85,
  },
  cascade: {
    widthScale: 1.05,
    lengthScale: 1.2,
    deformation: 2,
    cohesion: 0.2,
  },
};

export type SpillSettings = typeof defaultSpillSettings;
// Shared configuration for the simulation and render modules.
export const spillSettings: SpillSettings =
  structuredClone(defaultSpillSettings);
