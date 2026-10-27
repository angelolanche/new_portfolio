import { projects } from '../../../../content/projects';
import { isSignalTravelling, type SignalNavigation } from './signalNavigation';

export const cameraSensitivityScale = 0.85;
export const pointerLookSensitivity =
  2.3 * 0.85 * 0.85 * cameraSensitivityScale;
const stopTolerance = 0.00001;
const flightTolerance = 0.0001;

export function isSignalFreeFlight(navigation: SignalNavigation) {
  if (navigation.mode === 'free') return true;
  const flight = navigation.flight;
  return Boolean(
    flight &&
    (Math.hypot(flight.position.x, flight.position.y, flight.position.z) >=
      flightTolerance ||
      Math.hypot(flight.target.x, flight.target.y, flight.target.z) >=
        flightTolerance ||
      flight.movement.forward ||
      flight.movement.right ||
      flight.movement.up),
  );
}

/** Every framed stop supports inspection; leaving its position enables free look. */
export function isInspectingSignalStop(navigation: SignalNavigation) {
  if (isSignalTravelling(navigation)) return false;
  const atStop =
    Math.abs(navigation.target) < stopTolerance ||
    Math.abs(navigation.target - 1) < stopTolerance ||
    projects.some(
      (project) =>
        Math.abs(project.progress - navigation.target) < stopTolerance,
    );
  if (!atStop) return false;
  return !isSignalFreeFlight(navigation);
}
