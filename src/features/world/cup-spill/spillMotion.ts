import { spillSettings } from './spillSettings';
import { glassPosition, tableRadius } from '../sceneLayout';

export const impactTime = spillSettings.timing.impactAfterStart;
export const spillDuration = impactTime + spillSettings.timing.actionDuration;
export const simulationStepSeconds = spillSettings.timing.simulationStep;
function buildCupTiltSamples() {
  const cupOuterRadius = 0.106 * spillSettings.cup.radiusScale;
  const cupHalfHeight = 0.21 * spillSettings.cup.heightScale;
  const pivotInertiaPerUnitMass =
    (2 * cupHalfHeight) ** 2 / 12 +
    cupOuterRadius ** 2 / 2 +
    cupHalfHeight ** 2 +
    cupOuterRadius ** 2;
  const tiltAngleSamples = [0];
  let angularVelocity = spillSettings.motion.initialAngularVelocity;
  let secondImpulseApplied = false;
  let contactDelay = Infinity;

  // A brief sideways impulse rocks the glass, then the returning table impulse tips it.
  // Integrate gravity around the supporting base rim; mass cancels in torque / inertia.

  for (
    let stepIndex = 1;
    stepIndex <=
    Math.ceil(spillSettings.timing.actionDuration / simulationStepSeconds);
    stepIndex++
  ) {
    let angle = tiltAngleSamples[stepIndex - 1];
    if (
      !secondImpulseApplied &&
      stepIndex * simulationStepSeconds >=
        spillSettings.motion.secondImpulseDelay
    ) {
      angularVelocity += spillSettings.motion.secondAngularImpulse;
      secondImpulseApplied = true;
    }
    const supportDirection = angle < 0 ? -1 : 1;
    angularVelocity +=
      ((spillSettings.water.gravity *
        (cupHalfHeight * Math.sin(angle) -
          0.085 *
            spillSettings.cup.radiusScale *
            supportDirection *
            Math.cos(angle))) /
        pivotInertiaPerUnitMass) *
      simulationStepSeconds;
    angle += angularVelocity * simulationStepSeconds;
    if (angle >= Math.PI / 2) {
      contactDelay = stepIndex * simulationStepSeconds;
      tiltAngleSamples.push(Math.PI / 2);
      break;
    }
    tiltAngleSamples.push(angle);
  }

  return { tiltAngleSamples, contactDelay };
}

const { tiltAngleSamples, contactDelay } = buildCupTiltSamples();
export const glassContactTime = impactTime + contactDelay;

export function sampleSpillMotion(seconds: number) {
  const age = Math.max(0, seconds - impactTime);
  let angle = 0;
  if (seconds > impactTime && seconds < glassContactTime) {
    const samplePosition = Math.min(
      age / simulationStepSeconds,
      tiltAngleSamples.length - 1,
    );
    const sampleIndex = Math.floor(samplePosition);
    angle =
      tiltAngleSamples[sampleIndex] +
      ((tiltAngleSamples[sampleIndex + 1] ?? tiltAngleSamples[sampleIndex]) -
        tiltAngleSamples[sampleIndex]) *
        (samplePosition - sampleIndex);
  } else if (seconds >= glassContactTime) {
    const bounceProgress = Math.min(
      1,
      (seconds - glassContactTime) / spillSettings.motion.bounceDuration,
    );
    angle =
      Math.PI / 2 -
      spillSettings.motion.bounceAngle *
        Math.sin(Math.PI * bounceProgress) *
        (1 - bounceProgress);
  }
  // The tapered cup rolls around the centre of its axis, on a shallow arc.
  const rollAge = Math.max(
    0,
    seconds - glassContactTime - spillSettings.motion.bounceDuration,
  );
  const t = Math.min(1, rollAge / spillSettings.motion.rollDuration);
  const rollProgress = 1 - (1 - t * t) ** 3;
  const distance = spillSettings.motion.rollDistance * rollProgress;
  const meanRadius = 0.0955 * spillSettings.cup.radiusScale;
  const curvature =
    (0.021 * spillSettings.cup.radiusScale) /
    (0.42 * spillSettings.cup.heightScale * meanRadius);
  const yaw = distance * curvature;
  const rollX = (1 - Math.cos(yaw)) / curvature;
  const rollZ = Math.sin(yaw) / curvature;
  const coneSlope = Math.atan(
    (0.021 * spillSettings.cup.radiusScale) /
      (0.42 * spillSettings.cup.heightScale),
  );
  angle -= coneSlope * rollProgress;
  const halfHeight = 0.21 * spillSettings.cup.heightScale;
  return {
    angle,
    yaw,
    spin: distance / meanRadius,
    x:
      glassPosition[0] +
      rollX +
      halfHeight * Math.sin(angle) * (Math.cos(yaw) - 1),
    z: glassPosition[2] + rollZ - halfHeight * Math.sin(angle) * Math.sin(yaw),
    lift:
      (0.112 - 0.021 * rollProgress) *
      spillSettings.cup.radiusScale *
      Math.abs(Math.sin(angle)),
    jolt:
      seconds > impactTime && age < spillSettings.motion.joltDuration
        ? spillSettings.motion.joltDistance *
          Math.sin(age * spillSettings.motion.joltFrequency) *
          Math.exp(-age * spillSettings.motion.joltDamping) *
          (1 - age / spillSettings.motion.joltDuration)
        : 0,
    slosh:
      seconds > impactTime
        ? spillSettings.motion.sloshAngle *
          Math.sin(age * spillSettings.motion.sloshFrequency) *
          Math.exp(-age * spillSettings.motion.sloshDamping)
        : 0,
  };
}
export const spillEdgeX = -Math.sqrt(tableRadius ** 2 - glassPosition[2] ** 2);
