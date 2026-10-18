import { Box3, Matrix4, PerspectiveCamera, Ray, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { sampleOpening, openingDuration } from './cameraPath';
import {
  roomBounds,
  entryDoorPosition,
  entryDoorScale,
  sideWindowPosition,
  sideWindowScale,
  sofaPosition,
  wallUnitUpperPanels,
  wovenChairPosition,
  wovenChairYaw,
  glassCenter,
  armchairPosition,
  armchairYaw,
  televisionPosition,
  tablePosition,
  tableRadius,
} from './sceneLayout';

const worldToChair = new Matrix4()
  .makeRotationY(armchairYaw)
  .setPosition(...armchairPosition)
  .invert();
const chairBounds = new Box3(
  new Vector3(-0.62, 0, -0.5),
  new Vector3(0.62, 1.325, 0.5),
);

it('moves only the door another twenty percent of its width from the window, beyond the current frame', () => {
  const projectDoor = (time: number, y: number, zOffset: number) => {
    const pose = sampleOpening(time, 16 / 9);
    const camera = new PerspectiveCamera(pose.fov, 16 / 9, 0.03, 40);
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
    camera.updateMatrixWorld();
    return new Vector3(...entryDoorPosition)
      .add(
        new Vector3(
          0.06 * entryDoorScale[2],
          y * entryDoorScale[1],
          zOffset * entryDoorScale[0],
        ),
      )
      .project(camera);
  };
  const start = projectDoor(0, 1.5, -0.525);
  expect(start.x).toBeLessThan(-1);
  expect(entryDoorPosition[2] - 2.49).toBeCloseTo(
    0.9 * entryDoorScale[0] * 0.2,
  );
  expect(projectDoor(0, 1.5, 0).x).toBeLessThan(-1);
  expect(2.2 * entryDoorScale[1]).toBeGreaterThan(2.5);
  expect(1.05 * entryDoorScale[0]).toBeGreaterThan(1.2);
  expect(entryDoorPosition[2] - 0.525 * entryDoorScale[0]).toBeGreaterThan(1);
  expect(entryDoorPosition[2]).toBeGreaterThan(sofaPosition[2] + 0.59);
  const windowFront = sideWindowPosition[2] + 1.15 * sideWindowScale[0];
  const doorBack = entryDoorPosition[2] - 0.525 * entryDoorScale[0];
  expect(doorBack - windowFront).toBeGreaterThan(1.8);
  expect(1.75 * sideWindowScale[0]).toBeLessThan(1.55);
  expect(1.9 * sideWindowScale[1]).toBeLessThan(1.8);
  expect(Math.abs(start.y)).toBeLessThan(1);
  expect(entryDoorPosition[0] - roomBounds.left).toBeCloseTo(0.1);
  for (const y of [0, 2.315])
    for (const z of [-0.525, 0.525]) {
      expect(projectDoor(0, y, z).x).toBeLessThan(-1);
      expect(projectDoor(openingDuration * 0.6, y, z).x).toBeLessThan(-1);
      expect(projectDoor(openingDuration, y, z).x).toBeLessThan(-1);
    }
});

it('keeps the room compact, sofa near the TV and wall unit close to the right wall', () => {
  expect(roomBounds.right - roomBounds.left).toBeLessThanOrEqual(6.8);
  expect(roomBounds.front - roomBounds.back).toBeLessThanOrEqual(8.7);
  const unitRight = Math.max(
    ...wallUnitUpperPanels.map(
      (panel) => televisionPosition[0] + panel.position[0] + panel.size[0] / 2,
    ),
  );
  expect(roomBounds.right - unitRight).toBeLessThan(1);
  expect(roomBounds.right - unitRight).toBeGreaterThan(0.5);
  expect(sofaPosition[2] - televisionPosition[2]).toBeLessThan(4);
  expect(tablePosition[0] + tableRadius).toBeLessThan(roomBounds.right);
});

it('keeps the tall wall unit clear of the TV and antenna sightlines', () => {
  const targets = [];
  for (const x of [-0.625, 0.625])
    for (const y of [0.865, 1.775])
      for (const z of [-0.36, 0.394]) {
        targets.push(
          new Vector3(...televisionPosition).add(new Vector3(x, y, z)),
        );
      }
  for (const x of [-0.33, 0.33])
    targets.push(
      new Vector3(...televisionPosition).add(new Vector3(x, 2.31, -0.05)),
    );
  const panels = wallUnitUpperPanels.map((panel) =>
    new Box3().setFromCenterAndSize(
      new Vector3(...televisionPosition).add(new Vector3(...panel.position)),
      new Vector3(...panel.size),
    ),
  );
  for (const aspect of [16 / 9, 4 / 3, 390 / 730])
    for (let step = 0; step <= 20; step++) {
      const origin = sampleOpening(
        (step * openingDuration) / 20,
        aspect,
      ).position;
      for (const target of targets) {
        const ray = new Ray(origin, target.clone().sub(origin).normalize());
        for (const panel of panels) {
          const hit = ray.intersectBox(panel, new Vector3());
          if (hit)
            expect(hit.distanceTo(origin)).toBeGreaterThan(
              target.distanceTo(origin),
            );
        }
      }
    }
});

describe('armchair placement', () => {
  it('faces the TV and leaves passage between the chair and phone table', () => {
    const forward = new Vector3(0, 0, -1).applyAxisAngle(
      new Vector3(0, 1, 0),
      armchairYaw,
    );
    const towardTV = new Vector3(...televisionPosition)
      .sub(new Vector3(...armchairPosition))
      .normalize();
    expect(forward.dot(towardTV)).toBeGreaterThan(0.999);
    const table = new Vector3(...tablePosition).applyMatrix4(worldToChair);
    const clearance =
      Math.hypot(
        Math.max(Math.abs(table.x) - 0.62, 0),
        Math.max(Math.abs(table.z) - 0.5, 0),
      ) - tableRadius;
    expect(clearance).toBeGreaterThan(0.45);
  });
  it.each([16 / 9, 390 / 730])(
    'does not obscure the TV during the camera move at aspect %s',
    (aspect) => {
      for (let step = 0; step <= 20; step++) {
        const origin = sampleOpening(
          (step * openingDuration) / 20,
          aspect,
        ).position.applyMatrix4(worldToChair);
        for (const x of [-0.625, 0, 0.625])
          for (const y of [0.865, 1.32, 1.775]) {
            const target = new Vector3(...televisionPosition)
              .add(new Vector3(x, y, 0.394))
              .applyMatrix4(worldToChair);
            const ray = new Ray(origin, target.clone().sub(origin).normalize());
            expect(ray.intersectBox(chairBounds, new Vector3())).toBeNull();
          }
      }
    },
  );
});

describe('woven chair placement', () => {
  it('tucks the seat under the table while keeping the backrest outside and facing inward', () => {
    const towardTable = new Vector3(...tablePosition).sub(
      new Vector3(...wovenChairPosition),
    );
    expect(wovenChairPosition[2]).toBeGreaterThan(tablePosition[2]);
    const forward = new Vector3(0, 0, -1).applyAxisAngle(
      new Vector3(0, 1, 0),
      wovenChairYaw,
    );
    expect(forward.dot(towardTable.clone().normalize())).toBeGreaterThan(0.999);
    const distance = towardTable.length();
    expect(distance).toBeGreaterThan(tableRadius);
    const insertion = tableRadius - (distance - 0.27);
    expect(insertion).toBeGreaterThan(0.05);
    expect(insertion).toBeLessThan(0.2);
    const tableInChair = towardTable
      .clone()
      .applyAxisAngle(new Vector3(0, 1, 0), -wovenChairYaw);
    expect(0.21 - tableInChair.z).toBeGreaterThan(tableRadius + 0.1);
  });
  it('keeps the glass and TV unobstructed through landscape and portrait camera moves', () => {
    const inverse = new Matrix4()
      .makeRotationY(wovenChairYaw)
      .setPosition(...wovenChairPosition)
      .invert();
    const bounds = new Box3(
      new Vector3(-0.3, 0, -0.3),
      new Vector3(0.3, 1.25, 0.3),
    );
    const targets = [glassCenter];
    for (const x of [-0.625, 0.625])
      for (const y of [0.865, 1.775])
        targets.push(
          new Vector3(...televisionPosition).add(new Vector3(x, y, 0.394)),
        );
    for (const aspect of [16 / 9, 390 / 730])
      for (let step = 0; step <= 20; step++) {
        const origin = sampleOpening(
          (step * openingDuration) / 20,
          aspect,
        ).position.applyMatrix4(inverse);
        for (const target of targets) {
          const direction = target
            .clone()
            .applyMatrix4(inverse)
            .sub(origin)
            .normalize();
          expect(
            new Ray(origin, direction).intersectBox(bounds, new Vector3()),
          ).toBeNull();
        }
      }
  });
});
