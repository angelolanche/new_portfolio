import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { openingDuration, sampleOpening } from './cameraPath';
import {
  sofaPosition,
  televisionPosition,
  glassCenter,
  glassPosition,
  tableRadius,
  waterFlowClearance,
  tablePosition,
} from './sceneLayout';
const aspects = [16 / 9, 4 / 3, 390 / 730];
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
    'retains the complete TV and antenna through the move at aspect %s',
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
                    (step * openingDuration) / 20,
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
    'enlarges the glass on the right while keeping it visible at aspect %s',
    (aspect) => {
      for (let step = 0; step <= 20; step++) {
        for (const x of [-0.106, 0.106])
          for (const y of [-0.215, 0.215]) {
            expectInFrame(
              project(
                glassCenter.clone().add(new Vector3(x, y, 0)),
                (step * openingDuration) / 20,
                aspect,
              ),
            );
          }
      }
      const end = project(glassCenter, openingDuration, aspect);
      expect(end.x).toBeGreaterThan(0.45);
      expect(
        glassHeight(openingDuration, aspect) / glassHeight(0, aspect),
      ).toBeGreaterThan(aspect < 1 ? 1.1 : 2.5);
      if (aspect >= 1)
        expect(glassHeight(openingDuration, aspect)).toBeGreaterThan(0.4);
    },
  );
  it.each(aspects)(
    'descends, looks upward and moves toward the TV smoothly at aspect %s',
    (aspect) => {
      let previous = sampleOpening(0, aspect);
      const tv = new Vector3(...televisionPosition).add(
        new Vector3(0, 1.32, 0),
      );
      for (let step = 1; step <= 20; step++) {
        const pose = sampleOpening((step * openingDuration) / 20, aspect);
        expect(pose.position.y).toBeLessThanOrEqual(previous.position.y);
        expect(pose.position.distanceTo(tv)).toBeLessThan(
          previous.position.distanceTo(tv),
        );
        expect(
          pose.target.clone().sub(pose.position).normalize().y,
        ).toBeGreaterThan(
          previous.target.clone().sub(previous.position).normalize().y,
        );
        previous = pose;
      }
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
    expect(openingDuration).toBe(5);
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
