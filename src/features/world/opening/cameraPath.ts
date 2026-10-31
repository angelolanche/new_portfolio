import { Vector3 } from 'three';
import { televisionPosition } from '../room/sceneLayout';

import { openingDuration } from './timing';
export { openingDuration } from './timing';
const originalPathDuration = 10;
const pointerLookEnd = openingDuration - 1;
// Continue through the glass at the same world-space speed on both render paths.
export const televisionApproachSpeed = 0.28;

export function sampleLookWeight(seconds: number) {
  // Center only for the CRT handoff, then smoothly restore pointer control.
  if (seconds >= openingDuration) {
    const t = Math.min(1, (seconds - openingDuration) / 1.2);
    return t * t * (3 - 2 * t);
  }
  return Math.max(0, Math.min(1, (pointerLookEnd - seconds) / 2));
}

function cubicPoint(
  start: Vector3,
  first: Vector3,
  second: Vector3,
  end: Vector3,
  t: number,
) {
  const inverse = 1 - t;
  return start
    .multiplyScalar(inverse * inverse * inverse)
    .addScaledVector(first, 3 * inverse * inverse * t)
    .addScaledVector(second, 3 * inverse * t * t)
    .addScaledVector(end, t * t * t);
}

function smoothStep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function cubicTangent(
  start: Vector3,
  first: Vector3,
  second: Vector3,
  end: Vector3,
  t: number,
) {
  const inverse = 1 - t;
  return first
    .clone()
    .sub(start)
    .multiplyScalar(3 * inverse * inverse)
    .addScaledVector(second.clone().sub(first), 6 * inverse * t)
    .addScaledVector(end.clone().sub(second), 3 * t * t);
}

function cubicAcceleration(
  start: Vector3,
  first: Vector3,
  second: Vector3,
  end: Vector3,
  t: number,
) {
  return second
    .clone()
    .add(start)
    .addScaledVector(first, -2)
    .multiplyScalar(6 * (1 - t))
    .addScaledVector(end.clone().add(first).addScaledVector(second, -2), 6 * t);
}

function easedCoordinate(
  start: number,
  tangent: number,
  acceleration: number,
  end: number,
  duration: number,
  t: number,
  terminalTangent = 0,
  terminalAcceleration = 0,
) {
  // Match position, velocity and acceleration at both ends of the segment.
  const velocity = tangent * duration;
  const bend = (acceleration * duration * duration) / 2;
  const displacement = end - start - velocity - bend;
  const endVelocity = terminalTangent * duration - velocity - 2 * bend;
  const endAcceleration = terminalAcceleration * duration * duration - 2 * bend;
  const cubic = 10 * displacement - 4 * endVelocity + endAcceleration / 2;
  const quartic = -15 * displacement + 7 * endVelocity - endAcceleration;
  const quintic = 6 * displacement - 3 * endVelocity + endAcceleration / 2;
  return (
    start +
    velocity * t +
    bend * t * t +
    cubic * t ** 3 +
    quartic * t ** 4 +
    quintic * t ** 5
  );
}

// Constants and curve derivatives depend on viewport shape, not animation time.
// A sampler is owned by the camera and rebuilt only when the aspect changes.
export function createOpeningSampler(aspect: number, touchDevice = false) {
  const portrait = aspect < 1;
  const start = new Vector3(3.05, 1.85, portrait ? 6.05 : 5.3);
  const television = new Vector3(...televisionPosition);
  const startTarget = new Vector3(portrait ? 2.4 : 2.3, 1.25, 2.6);
  const screenCenter = television.clone().add(new Vector3(-0.1, 1.34, 0.372));
  const formerEnd = television.clone().add(new Vector3(-0.1, 1.34, -0.72));
  // Keep the approach lens readable; the signal world widens further after entry.
  const finalFov = touchDevice ? 80 : portrait ? 54 : 50;
  const screenFrontZ = screenCenter.z + 0.022;
  const lensTangent = Math.tan((finalFov * Math.PI) / 360);
  const coverDistance = Math.min(
    0.44 / (lensTangent * aspect),
    0.29 / lensTangent,
  );
  const endPosition = screenCenter.clone().setZ(screenFrontZ + coverDistance);
  const first = new Vector3(2.6, 1.2, portrait ? 5.1 : 4.7);
  const second = new Vector3(2.4, 0.8, 2.5);
  const alignmentStart = 0.55;
  const alignmentEnd = 0.83;
  const approachStart = alignmentEnd * originalPathDuration;
  const approachDistance = portrait ? 1.83 : 1.79;
  // Preserve the sofa passage; only the final approach changes its pace.
  const approachSpeed =
    (portrait ? 1.18 : 1.15) *
    (6.2 / 4.2) *
    (2.7 / (openingDuration - approachStart));
  const turnStartPosition = cubicPoint(
    start.clone(),
    first,
    second,
    formerEnd,
    alignmentStart,
  );
  const turnStartTangent = cubicTangent(
    start,
    first,
    second,
    formerEnd,
    alignmentStart,
  );
  const turnStartAcceleration = cubicAcceleration(
    start,
    first,
    second,
    formerEnd,
    alignmentStart,
  );
  return (seconds: number) => {
    const elapsed = Math.max(0, Math.min(openingDuration, seconds));
    const t = elapsed / originalPathDuration;
    const framingTime = Math.min(1, t);
    const finalApproach = (framingTime - 0.85) / 0.15;
    const progress =
      framingTime <= 0.85
        ? framingTime
        : 0.85 +
          0.15 *
            (finalApproach +
              finalApproach * finalApproach -
              finalApproach * finalApproach * finalApproach);
    // Inverse distance tracks projected screen size. Easing that quantity avoids
    // the apparent acceleration caused by moving very close to the glass.
    const approachZ =
      elapsed <= approachStart
        ? easedCoordinate(
            turnStartPosition.z,
            turnStartTangent.z / originalPathDuration,
            turnStartAcceleration.z / originalPathDuration ** 2,
            screenFrontZ + approachDistance,
            approachStart - alignmentStart * originalPathDuration,
            (elapsed - alignmentStart * originalPathDuration) /
              (approachStart - alignmentStart * originalPathDuration),
            -approachSpeed,
            (2 * approachSpeed ** 2) / approachDistance,
          )
        : screenFrontZ +
          1 /
            easedCoordinate(
              1 / approachDistance,
              approachSpeed / approachDistance ** 2,
              0,
              1 / coverDistance,
              openingDuration - approachStart,
              (elapsed - approachStart) / (openingDuration - approachStart),
              televisionApproachSpeed / coverDistance ** 2,
              (2 * televisionApproachSpeed ** 2) / coverDistance ** 3,
            );
    const position =
      t <= alignmentStart
        ? cubicPoint(start.clone(), first, second, formerEnd, t)
        : new Vector3(
            easedCoordinate(
              turnStartPosition.x,
              turnStartTangent.x,
              turnStartAcceleration.x,
              endPosition.x,
              alignmentEnd - alignmentStart,
              Math.min(
                1,
                (t - alignmentStart) / (alignmentEnd - alignmentStart),
              ),
            ),
            easedCoordinate(
              turnStartPosition.y,
              turnStartTangent.y,
              turnStartAcceleration.y,
              endPosition.y,
              alignmentEnd - alignmentStart,
              Math.min(
                1,
                (t - alignmentStart) / (alignmentEnd - alignmentStart),
              ),
            ),
            approachZ,
          );
    // Settle on the screen while passing the sofa; the later approach only
    // changes position, so the final frame can hand off to the static world.
    // A gentle outward arc clears the upholstered back and its near-plane
    // margin, returning to the original alignment before the CRT approach.
    const sofaPassage = Math.max(0, Math.min(1, (elapsed - 5.5) / 2.8));
    position.x += 0.55 * Math.sin(Math.PI * sofaPassage) ** 4;
    const acquireScreen = smoothStep(progress / (portrait ? 0.65 : 0.5));
    const target = startTarget.clone().lerp(screenCenter, acquireScreen);
    const movingFov = touchDevice
      ? 80
      : 50 + (portrait ? 4 * progress + 4 * Math.sin(Math.PI * progress) : 0);
    const settleLens = smoothStep((elapsed - 6.5) / (approachStart - 6.5));
    return {
      position,
      target,
      fov: movingFov + (finalFov - movingFov) * settleLens,
    };
  };
}

export function sampleOpening(
  seconds: number,
  aspect: number,
  touchDevice = false,
) {
  return createOpeningSampler(aspect, touchDevice)(seconds);
}
