import {
  Box3,
  Euler,
  Matrix4,
  Quaternion,
  Ray,
  RingGeometry,
  Sphere,
  SphereGeometry,
  Vector3,
} from 'three';
import { expect, it } from 'vitest';
import { sampleOpening } from './cameraPath';
import {
  planetPosition,
  planetRotation,
  planetScale,
  planetRadius,
  ringOuterRadius,
  ringInnerRadius,
  porchPillars,
  porchBeamPosition,
  porchBeamSize,
} from './exteriorLayout';
import {
  entryDoorPosition,
  sideWindowPosition,
  sideWindowScale,
  windowWallSections,
  roomBounds,
} from './sceneLayout';

it('keeps the entire globe and continuous outer ring outside the house and porch', () => {
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
  const e = matrix.elements;
  // Exact support along world X, including all parent scales/rotations.
  // Ring lies in planet-local XZ; no sparse vertex sampling or shader clipping.
  const globeNearestX = e[12] + planetRadius * Math.hypot(e[0], e[4], e[8]);
  const ringNearestX = e[12] + ringOuterRadius * Math.hypot(e[0], e[8]);
  const porchOuterEdge = -5.48 - 2 * 0.35 - 0.4 / 2;
  for (const nearestX of [globeNearestX, ringNearestX]) {
    expect(nearestX).toBeLessThan(roomBounds.left - 0.15 / 2 - 2);
    expect(nearestX).toBeLessThan(porchOuterEdge - 2);
  }
});

it('keeps the rendered globe and ring mesh bounds disjoint from the room and veranda', () => {
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
  // Includes wall thickness, extended ceiling, porch roof and the outermost step.
  const house = new Box3(
    new Vector3(roomBounds.left - 0.15, -0.2, roomBounds.back - 0.15),
    new Vector3(roomBounds.right + 0.15, 3.35, 7.15),
  );
  const porch = new Box3(
    new Vector3(-6.38, -0.6, -3.75),
    new Vector3(roomBounds.left, 3.1, 5.05),
  );
  const globe = new SphereGeometry(planetRadius, 64, 40);
  const rings = new RingGeometry(
    ringInnerRadius,
    ringOuterRadius,
    160,
    1,
  ).rotateX(-Math.PI / 2);
  for (const geometry of [globe, rings]) {
    geometry.applyMatrix4(matrix);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.intersectsBox(house)).toBe(false);
    expect(geometry.boundingBox!.intersectsBox(porch)).toBe(false);
    geometry.dispose();
  }
});

it('places a pillar and the roof edge on unobstructed sightlines through each opening', () => {
  const origin = sampleOpening(0, 16 / 9).position;
  const walls = windowWallSections.map(({ position, size }) =>
    new Box3().setFromCenterAndSize(
      new Vector3(...position),
      new Vector3(...size),
    ),
  );
  for (const z of porchPillars.slice(0, 2)) {
    for (const y of [1.6, porchBeamPosition[1] - porchBeamSize[1] / 2]) {
      const target = new Vector3(porchBeamPosition[0], y, z);
      const ray = new Ray(origin, target.sub(origin).normalize());
      expect(walls.some((wall) => ray.intersectsBox(wall))).toBe(false);
    }
  }
});

it('shows globe, rings and separating sky through both apertures with the distant framing', () => {
  const inverse = new Matrix4()
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
    )
    .invert();
  const origin = sampleOpening(0, 16 / 9).position;
  for (const [z, width, y, height] of [
    [entryDoorPosition[2], 1.08, 1.35, 2.3],
    [sideWindowPosition[2], 1.33, 1.7, 1.54],
  ]) {
    let rings = 0;
    let globe = 0;
    let separatingSky = 0;
    for (let column = 0; column < 24; column++) {
      for (let row = 0; row < 24; row++) {
        const target = new Vector3(
          sideWindowPosition[0],
          y + (row / 23 - 0.5) * height,
          z + (column / 23 - 0.5) * width,
        );
        const ray = new Ray(
          origin.clone(),
          target.sub(origin).normalize(),
        ).applyMatrix4(inverse);
        const hit = ray.intersectSphere(
          new Sphere(new Vector3(), planetRadius),
          new Vector3(),
        );
        const globeDistance = hit ? hit.distanceTo(ray.origin) : Infinity;
        const ringDistance = -ray.origin.y / ray.direction.y;
        const ringPoint = ray.at(ringDistance, new Vector3());
        const radius = Math.hypot(ringPoint.x, ringPoint.z);
        if (
          ringDistance > 0 &&
          ringDistance < globeDistance &&
          radius >= ringInnerRadius &&
          radius <= ringOuterRadius &&
          !(radius > 2.86 && radius < 3.06)
        )
          rings++;
        else if (hit) globe++;
        else if (
          ringDistance > 0 &&
          radius > planetRadius &&
          radius < ringInnerRadius
        )
          separatingSky++;
      }
    }
    // Neither a solid globe nor a featureless ring patch should fill the aperture.
    expect(rings / 576).toBeGreaterThan(0.15);
    // The smaller framing must expose space between the limb and rings,
    // instead of requiring the globe to cover the center of every opening.
    expect(globe / 576).toBeGreaterThan(0.09);
    expect(separatingSky / 576).toBeGreaterThan(0.12);
  }
});
