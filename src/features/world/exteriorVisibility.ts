import { Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { planetPosition, planetRotation, planetScale } from './exteriorLayout';
import {
  doorBack,
  doorFront,
  doorTop,
  roomBounds,
  sideWindowPosition,
  sideWindowScale,
} from './sceneLayout';

// Conservative volume around the entire camera path, including portrait starts.
// Orientation is intentionally unrestricted: pointer look cannot reveal a hole.
export const exteriorCameraEnvelope = new Box3(
  new Vector3(0.4, 0.7, -2.6),
  new Vector3(3.2, 2, 6.2),
);

// The path passes the sofa before aligning with the CRT. Keep those two
// volumes separate: the large enclosing box otherwise invents camera positions
// beside the TV at the back of the room and retains invisible ring particles.
// Bounds include the control-point hull before 5.5 s and the alignment after it;
// Y deliberately retains the full safety margin. Pointer look changes no position.
export const exteriorCameraVolumes = [
  new Box3(new Vector3(2.2, 0.7, 2.45), new Vector3(3.2, 2, 6.2)),
  new Box3(new Vector3(0.4, 0.7, -2.6), new Vector3(2.23, 2, 2.69)),
];

export const planetWorldMatrix = new Matrix4()
  .compose(
    new Vector3(...sideWindowPosition),
    new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)),
    new Vector3(...sideWindowScale),
  )
  .multiply(
    new Matrix4().compose(
      new Vector3(...planetPosition),
      new Quaternion().setFromEuler(new Euler(...planetRotation)),
      new Vector3().setScalar(planetScale),
    ),
  );

const apertureMargin = 0.08; // Includes finite particle footprints at the wall.
const apertures = [
  { bottom: 0, top: doorTop, back: doorBack, front: doorFront },
  {
    bottom: sideWindowPosition[1] - (1.72 * sideWindowScale[1]) / 2,
    top: sideWindowPosition[1] + (1.72 * sideWindowScale[1]) / 2,
    back: sideWindowPosition[2] - (1.57 * sideWindowScale[0]) / 2,
    front: sideWindowPosition[2] + (1.57 * sideWindowScale[0]) / 2,
  },
];

// Project the entire camera volume onto the wall from an exterior point.
// Extrema occur at volume corners (linear-fractional projection). Reject only
// if its projected rectangle misses BOTH expanded apertures. No frame sampling,
// frustum guess, or per-frame filtering; partially occluded candidates stay.
export function canAppearThroughOpenings(point: Vector3) {
  if (point.x >= roomBounds.left) return true;
  return exteriorCameraVolumes.some((volume) =>
    projectsThroughAperture(point, volume),
  );
}

function projectsThroughAperture(point: Vector3, volume: Box3) {
  const { min, max } = volume;
  let bottom = Infinity,
    top = -Infinity,
    back = Infinity,
    front = -Infinity;
  for (const x of [min.x, max.x]) {
    const t = (roomBounds.left - point.x) / (x - point.x);
    for (const y of [min.y, max.y]) {
      const hitY = point.y + (y - point.y) * t;
      bottom = Math.min(bottom, hitY);
      top = Math.max(top, hitY);
    }
    for (const z of [min.z, max.z]) {
      const hitZ = point.z + (z - point.z) * t;
      back = Math.min(back, hitZ);
      front = Math.max(front, hitZ);
    }
  }
  return apertures.some(
    (aperture) =>
      top >= aperture.bottom - apertureMargin &&
      bottom <= aperture.top + apertureMargin &&
      front >= aperture.back - apertureMargin &&
      back <= aperture.front + apertureMargin,
  );
}
