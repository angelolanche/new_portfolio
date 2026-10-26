import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import {
  sampleSpillMotion,
  spillDuration,
  glassContactTime,
  impactTime,
} from './spillMotion';
import { glassPosition, tableRadius } from '../sceneLayout';
import { openingDuration, sampleOpening } from '../cameraPath';

describe('tabletop spill choreography', () => {
  it('holds through the approach, reacts with the table, rocks opposite and then falls left', () => {
    expect(sampleSpillMotion(impactTime).angle).toBe(0);
    expect(sampleSpillMotion(impactTime + 0.05).angle).toBeLessThan(0);
    expect(Math.abs(sampleSpillMotion(impactTime + 0.03).jolt)).toBeGreaterThan(
      0,
    );
    expect(
      Math.abs(sampleSpillMotion(impactTime + 0.05).slosh),
    ).toBeGreaterThan(0);
    // The owner-selected lower gravity slightly lengthens the fall.
    expect(glassContactTime - impactTime).toBeLessThan(1.3);
    // The selected bounce now lasts 0.4 seconds.
    expect(sampleSpillMotion(glassContactTime + 0.2).angle).toBeLessThan(
      Math.PI / 2,
    );
    expect(sampleSpillMotion(glassContactTime + 0.4).angle).toBeCloseTo(
      Math.PI / 2,
    );
    expect(sampleSpillMotion(spillDuration).jolt).toBe(0);
    expect(sampleSpillMotion(0)).toEqual(sampleSpillMotion(-1));
    expect(sampleOpening(spillDuration, 1.6).position.z).toBeGreaterThan(
      sampleOpening(openingDuration, 1.6).position.z,
    );
    expect(
      sampleOpening(Math.max(spillDuration, openingDuration), 1.6),
    ).toEqual(sampleOpening(openingDuration, 1.6));
  });
  it('keeps the complete glass above and within the tabletop throughout the rock and fall', () => {
    for (let time = impactTime; time <= glassContactTime + 0.3; time += 0.01) {
      const { angle, lift } = sampleSpillMotion(time);
      for (const y of [0, 0.42]) {
        const radius = y === 0 ? 0.091 : 0.112;
        for (let i = 0; i < 32; i++) {
          const x = radius * Math.cos((i * Math.PI) / 16);
          const z = glassPosition[2] + radius * Math.sin((i * Math.PI) / 16);
          const rotatedX =
            glassPosition[0] + x * Math.cos(angle) - y * Math.sin(angle);
          const height = lift + x * Math.sin(angle) + y * Math.cos(angle);
          expect(height).toBeGreaterThanOrEqual(-0.00001);
          expect(Math.hypot(rotatedX, z)).toBeLessThan(tableRadius);
        }
      }
    }
  });
  it('rolls briefly toward the camera on an arc, stays on the table and comes to rest', () => {
    const before = sampleSpillMotion(glassContactTime + 0.4);
    const after = sampleSpillMotion(spillDuration);
    expect(after.z).toBeGreaterThan(before.z + 0.05);
    expect(after.z - before.z).toBeLessThan(0.12);
    expect(after.yaw).toBeGreaterThan(0.02);
    expect(after.yaw).toBeLessThan(0.1);
    expect(after.spin).toBeGreaterThan(0.5);
    expect(sampleSpillMotion(spillDuration + 1)).toMatchObject({
      x: after.x,
      z: after.z,
      yaw: after.yaw,
      spin: after.spin,
    });
    for (
      let time = glassContactTime + 0.4;
      time <= spillDuration;
      time += 0.025
    ) {
      const pose = sampleSpillMotion(time);
      const orientation = new Quaternion()
        .setFromAxisAngle(new Vector3(0, 1, 0), pose.yaw)
        .multiply(
          new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), pose.angle),
        )
        .multiply(
          new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -pose.spin),
        );
      for (const [y, radius] of [
        [0, 0.091],
        [0.42, 0.112],
      ])
        for (let i = 0; i < 48; i++) {
          const phase = (i / 48) * Math.PI * 2;
          const point = new Vector3(
            radius * Math.cos(phase),
            y,
            radius * Math.sin(phase),
          ).applyQuaternion(orientation);
          expect(point.y + pose.lift).toBeGreaterThanOrEqual(-0.00001);
          expect(Math.hypot(point.x + pose.x, point.z + pose.z)).toBeLessThan(
            tableRadius,
          );
        }
    }
  });
  it('accelerates toward contact and has no pose jumps at the action beats', () => {
    const early =
      (sampleSpillMotion(impactTime + 0.35).angle -
        sampleSpillMotion(impactTime + 0.34).angle) /
      0.01;
    const late =
      (sampleSpillMotion(glassContactTime - 0.02).angle -
        sampleSpillMotion(glassContactTime - 0.03).angle) /
      0.01;
    expect(late).toBeGreaterThan(early);
    for (const t of [
      impactTime,
      impactTime + 0.12,
      glassContactTime,
      glassContactTime + 0.4,
      spillDuration,
    ]) {
      expect(
        Math.abs(
          sampleSpillMotion(t + 0.0001).angle -
            sampleSpillMotion(t - 0.0001).angle,
        ),
      ).toBeLessThan(0.004);
    }
  });
});
