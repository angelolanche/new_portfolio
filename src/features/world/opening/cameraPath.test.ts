import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  createOpeningSampler,
  openingDuration,
  sampleLookWeight,
  sampleOpening,
  televisionApproachSpeed,
} from './cameraPath';
import { signalEntryEnd, televisionEntryDuration } from './timing';
import {
  sampleTelevisionEntry,
  televisionScreenCenter,
  televisionWorldScale,
} from '../signal-world/rendering/televisionWorld';
import { glassContactTime, impactTime } from '../cup-spill/spillMotion';
import {
  sofaPosition,
  televisionPosition,
  glassCenter,
  glassPosition,
  tableRadius,
  waterFlowClearance,
  tablePosition,
} from '../room/sceneLayout';
const aspects = [16 / 9, 4 / 3, 390 / 730];

it.each([0.4, 9 / 16, 1, 4 / 3, 16 / 9, 32 / 9])(
  'crosses the CRT without stopping or changing velocity at aspect %s',
  (aspect) => {
    const step = 0.0001;
    const end = sampleOpening(openingDuration, aspect).position;
    const startZ = (end.z - televisionScreenCenter.z) * televisionWorldScale;
    const distance = startZ + 1.5;
    const worldZ = (time: number) =>
      startZ - sampleTelevisionEntry(time, distance) * distance;
    const incoming =
      ((end.z - sampleOpening(openingDuration - step, aspect).position.z) *
        televisionWorldScale) /
      step;
    const outgoing = (worldZ(openingDuration + step) - startZ) / step;
    expect(incoming).toBeCloseTo(
      -televisionApproachSpeed * televisionWorldScale,
      3,
    );
    expect(outgoing).toBeCloseTo(incoming, 3);
    let previous = startZ;
    for (let frame = 1; frame <= 132; frame++) {
      const time = openingDuration + (frame / 132) * televisionEntryDuration;
      const next = worldZ(time);
      expect(next).toBeLessThan(previous);
      previous = next;
    }
    expect(worldZ(signalEntryEnd)).toBeCloseTo(-1.5, 8);
    expect(worldZ(signalEntryEnd + 5)).toBeCloseTo(-1.5, 8);
    expect(
      Math.abs(worldZ(signalEntryEnd) - worldZ(signalEntryEnd - step)) / step,
    ).toBeLessThan(0.001);
    // Both approach and internal glide must stay monotonic, including wide screens.
    for (let time = 8.3; time < openingDuration - step; time += 1 / 60)
      expect(sampleOpening(time + step, aspect).position.z).toBeLessThan(
        sampleOpening(time, aspect).position.z,
      );
  },
);

it('keeps viewport samplers independent and repeatable across backwards seeks', () => {
  const landscape = createOpeningSampler(16 / 9);
  const portrait = createOpeningSampler(9 / 16);
  const initial = landscape(0);
  for (const time of [5.5, 8.3, openingDuration, 2.2, 0]) {
    const pose = landscape(time);
    const expected = sampleOpening(time, 16 / 9);
    expect(pose.position.distanceTo(expected.position)).toBe(0);
    expect(pose.target.distanceTo(expected.target)).toBe(0);
    expect(pose.fov).toBe(expected.fov);
    portrait(time);
  }
  expect(landscape(0)).toEqual(initial);
  expect(portrait(0).position.z).toBeGreaterThan(initial.position.z);
});

it('uses a wider lens for mobile while preserving the approved desktop field of view', () => {
  const desktop = sampleOpening(8, 390 / 730).fov;
  const mobile = sampleOpening(8, 390 / 730, true).fov;
  expect(desktop).toBeLessThan(60);
  expect(mobile).toBeGreaterThan(desktop + 20);
});
function project(point: Vector3, time: number, aspect: number) {
  const pose = sampleOpening(time, aspect);
  const camera = new PerspectiveCamera(pose.fov, aspect, 0.03, 40);
  camera.position.copy(pose.position);
  camera.lookAt(pose.target);
  camera.updateMatrixWorld();
  return point.clone().project(camera);
}
function expectInFrame(point: Vector3) {
  expect(Math.abs(point.x)).toBeLessThan(1);
  expect(Math.abs(point.y)).toBeLessThan(1);
  expect(point.z).toBeGreaterThan(-1);
  expect(point.z).toBeLessThan(1);
}
function glassHeight(time: number, aspect: number) {
  return (
    (project(glassCenter.clone().add(new Vector3(0, 0.215, 0)), time, aspect)
      .y -
      project(glassCenter.clone().add(new Vector3(0, -0.215, 0)), time, aspect)
        .y) /
    2
  );
}
describe('opening framing', () => {
  it.each(aspects)(
    'keeps the camera and near plane clear of the sofa at aspect %s',
    (aspect) => {
      const origin = new Vector3(...sofaPosition);
      const upholstery = [
        new Box3(new Vector3(-1.4, 0.44, 0.19), new Vector3(1.4, 1.4, 0.59)),
        new Box3(
          new Vector3(-1.459, 0.325, -0.525),
          new Vector3(1.459, 0.955, 0.525),
        ),
      ].map((box) => box.translate(origin).expandByScalar(0.12));
      const camera = new PerspectiveCamera(50, aspect, 0.03, 40);
      for (let time = 0; time <= openingDuration; time += 0.02) {
        const pose = sampleOpening(time, aspect);
        camera.position.copy(pose.position);
        camera.fov = pose.fov;
        camera.lookAt(pose.target);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        const points = [pose.position];
        for (const x of [-1, 1])
          for (const y of [-1, 1])
            points.push(new Vector3(x, y, -1).unproject(camera));
        for (const point of points)
          expect(
            upholstery.some((box) => box.containsPoint(point)),
            `sofa clearance at ${time}s`,
          ).toBe(false);
      }
    },
  );
  it('releases pointer look during the final approach so the TV can center', () => {
    expect(sampleLookWeight(0)).toBe(1);
    expect(sampleLookWeight(openingDuration - 3)).toBe(1);
    expect(sampleLookWeight(openingDuration - 2)).toBeCloseTo(0.5);
    expect(sampleLookWeight(openingDuration - 1)).toBe(0);
    expect(sampleLookWeight(openingDuration)).toBe(0);
  });
  it.each(aspects)(
    'shakes the table before reaching it, then stops at the TV screen at aspect %s',
    (aspect) => {
      const beforeTable = tablePosition[2] + tableRadius + 0.5;
      expect(impactTime).toBeGreaterThan(0);
      expect(impactTime).toBeLessThan(3);
      expect(sampleOpening(impactTime, aspect).position.z).toBeGreaterThan(
        beforeTable,
      );
      expect(glassContactTime).toBeLessThan(openingDuration);
      expect(
        sampleOpening(glassContactTime, aspect).position.z,
      ).toBeGreaterThan(tablePosition[2] + tableRadius);
      expect(
        sampleOpening(glassContactTime + 1.4, aspect).position.z,
      ).toBeGreaterThan(tablePosition[2] + 0.5);
      for (const time of [impactTime, glassContactTime, 5]) {
        const before = sampleOpening(time - 0.01, aspect).position;
        const after = sampleOpening(time + 0.01, aspect).position;
        expect(before.distanceTo(after)).toBeGreaterThan(0.005);
        expect(after.z).toBeLessThan(before.z);
      }
      const end = sampleOpening(openingDuration, aspect);
      const screenCenter = new Vector3(...televisionPosition).add(
        new Vector3(-0.1, 1.34, 0.372),
      );
      expect(end.position.z).toBeGreaterThan(screenCenter.z + 0.4);
      expect(end.position.z).toBeLessThan(screenCenter.z + 0.8);
      expect(end.target.z).toBeCloseTo(screenCenter.z, 5);
      expect(end.target.x).toBeCloseTo(televisionPosition[0] - 0.1, 5);
      expect(end.target.y).toBeCloseTo(1.34, 5);
      const screenFront = screenCenter.z + 0.022;
      for (const x of [-0.45, 0.45])
        expect(
          Math.abs(
            project(
              new Vector3(screenCenter.x + x, screenCenter.y, screenFront),
              openingDuration,
              aspect,
            ).x,
          ),
        ).toBeGreaterThan(1);
      for (const y of [-0.3, 0.3])
        expect(
          Math.abs(
            project(
              new Vector3(screenCenter.x, screenCenter.y + y, screenFront),
              openingDuration,
              aspect,
            ).y,
          ),
        ).toBeGreaterThan(1);
    },
  );
  it.each(aspects)(
    'retains the complete TV and antenna until the table tremor at aspect %s',
    (aspect) => {
      for (let step = 0; step <= 20; step++) {
        for (const [xs, ys, zs] of [
          [
            [-0.625, 0.625],
            [0.865, 1.775],
            [-0.36, 0.394],
          ],
          [
            [-0.33, 0.33],
            [1.695, 2.31],
            [-0.065, -0.035],
          ],
        ])
          for (const x of xs)
            for (const y of ys)
              for (const z of zs) {
                expectInFrame(
                  project(
                    new Vector3(...televisionPosition).add(
                      new Vector3(x, y, z),
                    ),
                    (step * impactTime) / 20,
                    aspect,
                  ),
                );
              }
      }
    },
  );
  it.each([16 / 9, 390 / 730])(
    'starts exactly at the previously approved final view at aspect %s',
    (aspect) => {
      const start = sampleOpening(0, aspect);
      expect(start.position.toArray()).toEqual([
        3.05,
        1.85,
        aspect < 1 ? 6.05 : 5.3,
      ]);
      expect(start.target.toArray()).toEqual([
        aspect < 1 ? 2.4 : 2.3,
        1.25,
        2.6,
      ]);
      expect(start.fov).toBe(50);
    },
  );
  it.each(aspects)(
    'keeps the glass visible through the tremor at aspect %s',
    (aspect) => {
      for (let step = 0; step <= 20; step++) {
        for (const x of [-0.106, 0.106])
          for (const y of [-0.215, 0.215]) {
            expectInFrame(
              project(
                glassCenter.clone().add(new Vector3(x, y, 0)),
                (step * impactTime) / 20,
                aspect,
              ),
            );
          }
      }
      const end = project(glassCenter, impactTime, aspect);
      expect(end.x).toBeGreaterThan(0.2);
      expect(
        glassHeight(impactTime, aspect) / glassHeight(0, aspect),
      ).toBeGreaterThan(1.1);
      if (aspect >= 1)
        expect(glassHeight(impactTime, aspect)).toBeGreaterThan(0.1);
      expectInFrame(project(glassCenter, glassContactTime, aspect));
    },
  );
  it.each(aspects)(
    'moves toward the TV smoothly before the tremor at aspect %s',
    (aspect) => {
      let previous = sampleOpening(0, aspect);
      const tv = new Vector3(...televisionPosition).add(
        new Vector3(0, 1.32, 0),
      );
      for (let step = 1; step <= 20; step++) {
        const pose = sampleOpening((step * impactTime) / 20, aspect);
        expect(pose.position.y).toBeLessThanOrEqual(previous.position.y);
        expect(pose.position.distanceTo(tv)).toBeLessThan(
          previous.position.distanceTo(tv),
        );
        previous = pose;
      }
    },
  );
  it.each(aspects)(
    'centers the TV while passing the sofa and keeps it centered until the stop at aspect %s',
    (aspect) => {
      const screenCenter = new Vector3(...televisionPosition).add(
        new Vector3(-0.1, 1.34, 0.372),
      );
      const screenLockStart = aspect < 1 ? 6.5 : 5;
      const screenLockEnd = openingDuration;
      for (let step = 0; step <= 30; step++) {
        const time =
          screenLockStart + ((screenLockEnd - screenLockStart) * step) / 30;
        const projectedScreen = project(screenCenter, time, aspect);
        expect(Math.abs(projectedScreen.x)).toBeLessThan(0.01);
        expect(Math.abs(projectedScreen.y)).toBeLessThan(0.01);
      }
    },
  );
  it('starts alignment smoothly during the sofa passage and slows the approach', () => {
    const turnStart = sampleOpening(5.5, 16 / 9).position;
    expect(turnStart.x).toBeCloseTo(2.2182625, 5);
    expect(turnStart.y).toBeCloseTo(1.11917375, 5);
    expect(turnStart.z).toBeCloseTo(2.47201, 5);
    const sofaPassageX = sampleOpening(7, 16 / 9).position.x;
    expect(sofaPassageX).toBeLessThan(turnStart.x);
    expect(sofaPassageX).toBeGreaterThan(1.6);
    const speedAt = (time: number) =>
      sampleOpening(time + 0.05, 16 / 9).position.distanceTo(
        sampleOpening(time - 0.05, 16 / 9).position,
      );
    expect(speedAt(9)).toBeLessThan(speedAt(8));
    expect(speedAt(9.7)).toBeLessThan(speedAt(9));
    for (const join of [5.5, 8.3]) {
      const before = sampleOpening(join, 16 / 9).position.sub(
        sampleOpening(join - 0.01, 16 / 9).position,
      );
      const after = sampleOpening(join + 0.01, 16 / 9).position.sub(
        sampleOpening(join, 16 / 9).position,
      );
      expect(before.distanceTo(after)).toBeLessThan(0.001);
    }
  });
  it.each(aspects)(
    'finishes horizontal and vertical alignment before the last approach at aspect %s',
    (aspect) => {
      const end = sampleOpening(openingDuration, aspect).position;
      const beforeAlignment = sampleOpening(7.2, aspect).position;
      expect(beforeAlignment.x).toBeGreaterThan(end.x + 0.2);
      for (const time of [8.3, 8.8, 9.2, 10, 10.8, openingDuration]) {
        const position = sampleOpening(time, aspect).position;
        expect(position.x).toBeCloseTo(end.x, 6);
        expect(position.y).toBeCloseTo(end.y, 6);
      }
      expect(sampleOpening(8.3, aspect).position.z).toBeGreaterThan(
        end.z + 0.5,
      );
      const midApproach = 8.3 + (1.7 / 6.2) * (openingDuration - 8.3);
      expect(sampleOpening(midApproach, aspect).position.z).toBeGreaterThan(
        end.z + 0.2,
      );
      for (let time = 8.3; time < openingDuration - 0.1; time += 0.1) {
        const advance =
          sampleOpening(time, aspect).position.z -
          sampleOpening(time + 0.1, aspect).position.z;
        // Keep progressing perceptibly instead of easing almost to zero at the glass.
        expect(advance).toBeGreaterThan(0.015);
      }
    },
  );
  it.each(aspects)(
    'starts with the screen in frame and enlarges continuously through coverage at aspect %s',
    (aspect) => {
      const screenCenter = new Vector3(...televisionPosition).add(
        new Vector3(-0.1, 1.34, 0.394),
      );
      for (const x of [-0.45, 0.45])
        for (const y of [-0.3, 0.3])
          expectInFrame(
            project(
              screenCenter.clone().add(new Vector3(x, y, 0)),
              8.3,
              aspect,
            ),
          );
      const widthAt = (time: number) =>
        project(screenCenter.clone().add(new Vector3(0.45, 0, 0)), time, aspect)
          .x -
        project(
          screenCenter.clone().add(new Vector3(-0.45, 0, 0)),
          time,
          aspect,
        ).x;
      for (let time = 8.4; time < openingDuration - 0.1; time += 0.1) {
        const growth = widthAt(time + 0.1) - widthAt(time);
        expect(growth).toBeGreaterThan(0.02);
      }
      expect(
        widthAt(openingDuration) - widthAt(openingDuration - 0.1),
      ).toBeGreaterThan(0.02);
    },
  );
  it('retains the room alignment and initial tabletop spill area', () => {
    expect(Math.abs(sofaPosition[0] - televisionPosition[0])).toBeLessThan(1);
    expect(sofaPosition[2]).toBeGreaterThan(televisionPosition[2]);
    for (const aspect of aspects)
      for (const point of waterFlowClearance)
        expectInFrame(project(point, 0, aspect));
    expect(
      tableRadius - Math.hypot(glassPosition[0], glassPosition[2]),
    ).toBeGreaterThan(0.3);
    for (const point of waterFlowClearance.slice(0, 2)) {
      expect(
        Math.hypot(point.x - tablePosition[0], point.z - tablePosition[2]),
      ).toBeLessThan(tableRadius);
      expect(point.y).toBeGreaterThan(0.84);
    }
    for (const point of waterFlowClearance.slice(2)) {
      expect(
        Math.hypot(point.x - tablePosition[0], point.z - tablePosition[2]),
      ).toBeGreaterThan(tableRadius);
      expect(point.y).toBeLessThan(0.84);
    }
    expect(openingDuration).toBe(11.4);
  });
  it('holds the last frame, clamps the start and keeps position, aim and lens continuous', () => {
    expect(sampleOpening(100, 1.6)).toEqual(
      sampleOpening(openingDuration, 1.6),
    );
    expect(sampleOpening(-1, 1.6)).toEqual(sampleOpening(0, 1.6));
    for (let step = 0; step <= 20; step++) {
      const time = (step * openingDuration) / 20;
      const before = sampleOpening(time, 1.6);
      const after = sampleOpening(time + 0.0001, 1.6);
      expect(before.position.distanceTo(after.position)).toBeLessThan(0.002);
      expect(before.target.distanceTo(after.target)).toBeLessThan(0.003);
      expect(Math.abs(before.fov - after.fov)).toBeLessThan(0.002);
    }
  });
});
