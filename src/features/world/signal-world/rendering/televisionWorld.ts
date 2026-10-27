import { Vector3 } from 'three';
import {
  openingDuration,
  televisionApproachSpeed,
} from '../../opening/cameraPath';
import { televisionEntryDuration } from '../../opening/timing';
export { televisionEntryDuration } from '../../opening/timing';
import { televisionPosition } from '../../room/sceneLayout';

export const televisionScreenCenter = new Vector3(...televisionPosition).add(
  new Vector3(-0.1, 1.34, 0.394),
);
export const televisionWorldScale = 10;

export function sampleTelevisionEntry(seconds: number, distance = 7.5) {
  const t = Math.max(
    0,
    Math.min(1, (seconds - openingDuration) / televisionEntryDuration),
  );
  const velocity =
    (televisionApproachSpeed * televisionWorldScale * televisionEntryDuration) /
    distance;
  // Match incoming velocity and zero acceleration, then settle at the title.
  return (
    velocity * t +
    (10 - 6 * velocity) * t ** 3 +
    (-15 + 8 * velocity) * t ** 4 +
    (6 - 3 * velocity) * t ** 5
  );
}
