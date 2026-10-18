import { Vector3 } from 'three';
export const openingDuration = 5;
export function sampleOpening(seconds: number, aspect: number) {
  const t = Math.max(0, Math.min(1, seconds / openingDuration));
  const eased = t * t * (3 - 2 * t);
  const portrait = aspect < 1;
  const position = new Vector3(3.05, 1.85, portrait ? 6.05 : 5.3).lerp(
    new Vector3(portrait ? 2.5 : 2.4, 1.3, portrait ? 5 : 3.2),
    eased,
  );
  const startTarget = new Vector3(portrait ? 2.4 : 2.3, 1.25, 2.6);
  const endTarget = new Vector3(
    portrait ? 1.2 : aspect < 1.5 ? 0.8 : 0.65,
    portrait ? 1.02 : 0.82,
    -2.9,
  );
  // Interpolate the viewing direction, so looking up does not dip mid-move.
  const startPosition = new Vector3(3.05, 1.85, portrait ? 6.05 : 5.3);
  const endPosition = new Vector3(
    portrait ? 2.5 : 2.4,
    1.3,
    portrait ? 5 : 3.2,
  );
  const startDirection = startTarget.clone().sub(startPosition).normalize();
  const endDirection = endTarget.clone().sub(endPosition).normalize();
  const direction = startDirection.lerp(endDirection, eased).normalize();
  const distance =
    startTarget.distanceTo(startPosition) * (1 - eased) +
    endTarget.distanceTo(endPosition) * eased;
  const target =
    t === 0
      ? startTarget
      : t === 1
        ? endTarget
        : position.clone().addScaledVector(direction, distance);
  return { position, target, fov: 50 + (portrait ? 8 : 0) * eased };
}
