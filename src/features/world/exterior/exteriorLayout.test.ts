import {
  BackSide,
  Box3,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  Ray,
  Raycaster,
  Vector3,
} from 'three';
import { expect, it } from 'vitest';
import { openingDuration, sampleOpening } from '../opening/cameraPath';
import {
  exteriorBackdrop,
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
} from '../room/sceneLayout';

it('keeps the complete curved exterior beyond the room and veranda, including between mesh vertices', () => {
  const closestTriangle =
    exteriorBackdrop.radius * Math.cos(exteriorBackdrop.arc / 128);
  const roomAndPorchRadius = Math.hypot(6.4, 7.2);
  expect(closestTriangle - roomAndPorchRadius).toBeGreaterThan(2);
});

it('covers both apertures without revealing video edges across camera aspects, the approach and Replay', () => {
  const { radius, height, start, arc, position } = exteriorBackdrop;
  const geometry = new CylinderGeometry(
    radius,
    radius,
    height,
    64,
    1,
    true,
    start,
    arc,
  );
  const material = new MeshBasicMaterial({ side: BackSide });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.updateMatrixWorld();
  const raycaster = new Raycaster();
  for (const aspect of [0.4, 9 / 16, 1, 4 / 3, 16 / 9, 32 / 9]) {
    for (let step = 0; step <= 60; step++) {
      const origin = sampleOpening(
        (step / 60) * openingDuration,
        aspect,
      ).position;
      for (const [z, width, y, apertureHeight] of [
        [entryDoorPosition[2], 1.08, 1.265, 2.53],
        [
          sideWindowPosition[2],
          1.57 * sideWindowScale[0],
          sideWindowPosition[1],
          1.72 * sideWindowScale[1],
        ],
      ]) {
        for (const horizontal of [-0.5, 0, 0.5]) {
          for (const vertical of [-0.5, 0, 0.5]) {
            const target = new Vector3(
              roomBounds.left,
              y + vertical * apertureHeight,
              z + horizontal * width,
            );
            raycaster.set(origin, target.sub(origin).normalize());
            const [hit] = raycaster.intersectObject(mesh);
            expect(hit).toBeDefined();
            expect(hit.distance).toBeGreaterThan(70);
            expect(hit.uv!.x).toBeGreaterThan(0.02);
            expect(hit.uv!.x).toBeLessThan(0.98);
            expect(hit.uv!.y).toBeGreaterThan(0.02);
            expect(hit.uv!.y).toBeLessThan(0.98);
          }
        }
      }
    }
  }
  geometry.dispose();
  material.dispose();
});

it('retains the pillars and roof edge on unobstructed sightlines through each opening', () => {
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
