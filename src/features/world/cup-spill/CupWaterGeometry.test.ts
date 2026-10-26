import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { CupWaterGeometry } from './CupWaterGeometry';
import { glassContactTime, sampleSpillMotion } from './spillMotion';
import { initialWaterVolume, findWaterSurfaceHeight } from './cupWaterVolume';

describe('water inside the tilting glass', () => {
  it('keeps its free surface level under gravity rather than attached to the glass', () => {
    const geometry = new CupWaterGeometry();
    for (const angle of [0, 0.6, Math.PI / 2]) {
      const waterSurfaceHeight = findWaterSurfaceHeight(
        initialWaterVolume * 0.5,
        angle,
      );
      geometry.update(waterSurfaceHeight, angle, 0);
      const positions = geometry.getAttribute('position');
      let surfacePoints = 0;
      for (let i = 0; i < geometry.drawRange.count; i++) {
        const x = positions.getX(i),
          y = positions.getY(i),
          z = positions.getZ(i);
        const worldHeight = x * Math.sin(angle) + y * Math.cos(angle);
        expect(Number.isFinite(x + y + z)).toBe(true);
        expect(worldHeight).toBeLessThanOrEqual(waterSurfaceHeight + 1e-6);
        if (Math.abs(worldHeight - waterSurfaceHeight) < 1e-6) surfacePoints++;
      }
      expect(surfacePoints).toBeGreaterThan(20);
    }
    geometry.dispose();
  });
  it('keeps water horizontal while the tapered glass spins and turns during rolling', () => {
    const geometry = new CupWaterGeometry();
    const pose = sampleSpillMotion(glassContactTime + 1.1);
    const level = findWaterSurfaceHeight(initialWaterVolume * 0.2, pose.angle);
    geometry.update(level, pose.angle, 0, pose.spin);
    const rotation = new Quaternion()
      .setFromAxisAngle(new Vector3(0, 1, 0), pose.yaw)
      .multiply(
        new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), pose.angle),
      )
      .multiply(
        new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -pose.spin),
      );
    const positions = geometry.getAttribute('position');
    let capPoints = 0;
    for (let i = 0; i < geometry.drawRange.count; i++) {
      const world = new Vector3()
        .fromBufferAttribute(positions, i)
        .applyQuaternion(rotation);
      expect(world.y).toBeLessThanOrEqual(level + 1e-6);
      if (Math.abs(world.y - level) < 1e-6) capPoints++;
    }
    expect(capPoints).toBeGreaterThan(20);
    geometry.dispose();
  });
  it('renders a closed liquid volume consistent with the amount left in the glass', () => {
    const geometry = new CupWaterGeometry();
    for (const angle of [0.4, 1, Math.PI / 2]) {
      const target = initialWaterVolume * 0.4;
      geometry.update(findWaterSurfaceHeight(target, angle), angle, 0);
      const positions = geometry.getAttribute('position');
      let volume = 0;
      for (let i = 0; i < geometry.drawRange.count; i += 3) {
        const a = new Vector3().fromBufferAttribute(positions, i);
        const b = new Vector3().fromBufferAttribute(positions, i + 1);
        const c = new Vector3().fromBufferAttribute(positions, i + 2);
        volume += a.dot(b.cross(c)) / 6;
      }
      expect(Math.abs(volume - target) / target).toBeLessThan(0.025);
    }
    geometry.dispose();
  });
});
