import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { expect, it } from 'vitest';
import { createRingParticles } from './ringParticles';
import {
  planetPosition,
  planetRotation,
  planetScale,
  ringInnerRadius,
  ringOuterRadius,
} from './exteriorLayout';
import { sideWindowPosition, sideWindowScale } from './sceneLayout';
import { doorBack, doorFront, doorTop, roomBounds } from './sceneLayout';
import {
  exteriorCameraEnvelope,
  exteriorCameraVolumes,
  planetWorldMatrix,
} from './exteriorVisibility';
import { openingDuration, sampleOpening } from './cameraPath';

it('covers the complete landscape and portrait camera paths, including replay endpoints', () => {
  for (const aspect of [0.4, 9 / 16, 0.99, 1, 4 / 3, 16 / 9, 32 / 9]) {
    for (let step = 0; step <= 1000; step++) {
      const position = sampleOpening(
        (openingDuration * step) / 1000,
        aspect,
      ).position;
      expect(
        exteriorCameraVolumes.some((volume) => volume.containsPoint(position)),
      ).toBe(true);
      expect(
        exteriorCameraEnvelope.containsPoint(
          sampleOpening((openingDuration * step) / 1000, aspect).position,
        ),
      ).toBe(true);
    }
  }
});

it('removes hidden particles without changing any particle visible through an aperture', () => {
  const full = createRingParticles(6500, false);
  const reduced = createRingParticles();
  expect(reduced.sizes.length).toBeLessThan(full.sizes.length * 0.75);
  expect(reduced.sizes.length).toBeGreaterThan(0);
  const key = (positions: Float32Array, i: number) =>
    `${positions[i]},${positions[i + 1]},${positions[i + 2]}`;
  const retained = new Map(
    Array.from({ length: reduced.sizes.length }, (_, i) => [
      key(reduced.positions, i * 3),
      i,
    ]),
  );
  const origins = [0.4, 9 / 16, 0.99, 1, 4 / 3, 16 / 9, 32 / 9].flatMap(
    (aspect) =>
      Array.from(
        { length: 121 },
        (_, i) => sampleOpening((i * openingDuration) / 120, aspect).position,
      ),
  );
  const point = new Vector3();
  let missing = 0;
  for (let i = 0; i < full.sizes.length; i++) {
    const retainedIndex = retained.get(key(full.positions, i * 3));
    if (retainedIndex !== undefined) {
      expect(reduced.sizes[retainedIndex]).toBe(full.sizes[i]);
      expect(
        Array.from(
          reduced.colors.slice(retainedIndex * 3, retainedIndex * 3 + 3),
        ),
      ).toEqual(Array.from(full.colors.slice(i * 3, i * 3 + 3)));
      continue;
    }
    point.fromArray(full.positions, i * 3).applyMatrix4(planetWorldMatrix);
    const visible = origins.some((origin) => {
      const t = (roomBounds.left - origin.x) / (point.x - origin.x);
      const y = origin.y + (point.y - origin.y) * t;
      const z = origin.z + (point.z - origin.z) * t;
      const throughDoor =
        y >= 0 && y <= doorTop && z >= doorBack && z <= doorFront;
      const throughWindow =
        Math.abs(y - sideWindowPosition[1]) <=
          (1.72 * sideWindowScale[1]) / 2 &&
        Math.abs(z - sideWindowPosition[2]) <= (1.57 * sideWindowScale[0]) / 2;
      return throughDoor || throughWindow;
    });
    if (visible) missing++;
  }
  // Independent ray/aperture check has no frustum restriction, so it also
  // protects pointer-look extremes, arbitrary aspect ratios and paused frames.
  expect(missing).toBe(0);
});

it('keeps ice particles in the rings, outside the Cassini gap and beyond the veranda', () => {
  const { positions } = createRingParticles();
  const matrix = new Matrix4()
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
  const point = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    point.fromArray(positions, i);
    const r = Math.hypot(point.x, point.z);
    expect(r).toBeGreaterThan(ringInnerRadius);
    expect(r).toBeLessThan(ringOuterRadius);
    expect(r < 2.86 || r > 3.06).toBe(true);
    expect(Math.abs(point.y)).toBeLessThanOrEqual(0.014);
    point.applyMatrix4(matrix);
    expect(point.x).toBeLessThan(-8.38);
  }
});
