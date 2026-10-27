import type { Vector3 } from 'three';
import { projects } from '../../../../content/projects';
import { projectStandOff, signalSunPosition } from '../signalLayout';

export type SignalFlight = {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  movement: { forward: number; right: number; up: number };
  keys: Record<string, boolean>;
};
export function createFlight(): SignalFlight {
  return {
    position: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    movement: { forward: 0, right: 0, up: 0 },
    keys: {},
  };
}
export function clearFlightKeys(flight: SignalFlight) {
  flight.keys = {};
  flight.movement.forward = 0;
  flight.movement.right = 0;
  flight.movement.up = 0;
}
export function setFlightKey(
  flight: SignalFlight,
  key: string,
  pressed: boolean,
) {
  const normalized = key.toLowerCase();
  if (!['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(normalized))
    return false;
  flight.keys[normalized] = pressed;
  flight.movement.forward =
    Number(Boolean(flight.keys.w)) - Number(Boolean(flight.keys.s));
  flight.movement.right =
    Number(Boolean(flight.keys.d)) - Number(Boolean(flight.keys.a));
  flight.movement.up =
    Number(Boolean(flight.keys.e)) - Number(Boolean(flight.keys.q));
  return true;
}

export type SignalNavigation = {
  mode?: 'scroll' | 'free';
  progress: number;
  target: number;
  detailOpen: boolean;
  reducedMotion: boolean;
  flight?: SignalFlight;
  lookKeys?: Record<string, boolean>;
  travel?: { from: number; to: number; elapsed: number };
};

export function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function isSignalTravelling(navigation: SignalNavigation) {
  return (
    Boolean(
      navigation.travel &&
      navigation.travel.to === navigation.target &&
      navigation.travel.elapsed < signalTravelDuration,
    ) ||
    Math.abs(clampProgress(navigation.target) - navigation.progress) > 0.00001
  );
}

export const signalTravelDuration = 2.8;

export function setLookKey(
  navigation: SignalNavigation,
  key: string,
  pressed: boolean,
) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key))
    return false;
  navigation.lookKeys ??= {};
  navigation.lookKeys[key] = pressed;
  return true;
}

/** One gesture selects one complete work-to-work journey. */
export function nextWorkProgress(progress: number, direction: number) {
  const destinations = [0, ...projects.map((project) => project.progress), 1];
  return direction > 0
    ? (destinations.find((stop) => stop > progress + 0.00001) ?? 1)
    : (destinations.reverse().find((stop) => stop < progress - 0.00001) ?? 0);
}

const stops = [
  { progress: 0, x: 0, y: 0, z: 0, angle: 0, pitch: 0 },
  ...projects.map((p) => ({
    progress: p.progress,
    x: p.position[0] - Math.sin(p.angle) * projectStandOff,
    y: p.position[1] * 0.7,
    z: p.position[2] + Math.cos(p.angle) * projectStandOff + 1.5,
    angle: p.angle,
    pitch: Math.atan2(p.position[1] * 0.3, projectStandOff),
  })),
  {
    progress: 1,
    x: 0,
    y: signalSunPosition[1] * 0.35,
    z: signalSunPosition[2] + 59.5,
    angle: Math.PI * 2,
    pitch: Math.atan2(signalSunPosition[1] * 0.65, 58),
  },
];

export function advanceSignal(navigation: SignalNavigation, delta: number) {
  if (navigation.detailOpen) return;
  const target = clampProgress(navigation.target);
  if (navigation.reducedMotion) {
    navigation.progress = target;
    navigation.travel = undefined;
    return;
  }
  if (!navigation.travel || navigation.travel.to !== target) {
    if (navigation.progress === target) return;
    navigation.travel = { from: navigation.progress, to: target, elapsed: 0 };
  }
  const travel = navigation.travel;
  travel.elapsed = Math.min(
    signalTravelDuration,
    travel.elapsed + Math.max(0, Math.min(delta, 0.1)),
  );
  const t = travel.elapsed / signalTravelDuration;
  const eased = t * t * t * (10 + t * (-15 + 6 * t));
  navigation.progress =
    travel.elapsed >= signalTravelDuration
      ? target
      : travel.from + (target - travel.from) * eased;
}

/** Starts exactly at the approved automatic entry's final position. */
function segment(progress: number) {
  const t = clampProgress(progress);
  const nextIndex = Math.max(
    1,
    stops.findIndex((stop) => stop.progress >= t),
  );
  const before = stops[nextIndex - 1];
  const after = stops[nextIndex];
  const u = (t - before.progress) / (after.progress - before.progress);
  const eased = u * u * (3 - 2 * u);
  return { before, after, eased };
}

export function signalCameraAngles(progress: number) {
  const { before, after, eased } = segment(progress);
  return {
    yaw: -(before.angle + (after.angle - before.angle) * eased),
    pitch: before.pitch + (after.pitch - before.pitch) * eased,
  };
}

export function signalCameraOffset(progress: number, result: Vector3) {
  const { before, after, eased } = segment(progress);
  return result.set(
    before.x + (after.x - before.x) * eased,
    before.y + (after.y - before.y) * eased,
    before.z + (after.z - before.z) * eased,
  );
}
