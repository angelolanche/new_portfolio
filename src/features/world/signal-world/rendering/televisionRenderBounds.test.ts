import { expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { createTelevisionRenderBounds } from './televisionRenderBounds';
import { sampleOpening, openingDuration } from '../../opening/cameraPath';
import { televisionScreenCenter } from './televisionWorld';

it.each([16 / 9, 4 / 3, 9 / 16])(
  'shades fewer pixels at the start and covers every CRT corner through entry at aspect %s',
  (aspect) => {
    const width = 1200;
    const height = Math.round(width / aspect);
    const sampleBounds = createTelevisionRenderBounds();
    for (const seconds of [0, 2.2, 5.5, 8.3, 11, openingDuration]) {
      const pose = sampleOpening(seconds, aspect);
      const camera = new PerspectiveCamera(pose.fov, aspect, 0.03, 400);
      camera.position.copy(pose.position);
      camera.lookAt(pose.target);
      camera.updateMatrixWorld();
      const bounds = sampleBounds(camera, width, height);
      if (seconds === 0)
        expect(bounds.z * bounds.w).toBeLessThan(width * height * 0.25);
      for (const x of [-0.47, 0.47]) {
        for (const y of [-0.335, 0.335]) {
          const corner = televisionScreenCenter
            .clone()
            .add(new Vector3(x, y, 0))
            .project(camera);
          const pixelX = Math.max(
            0,
            Math.min(width, (corner.x * 0.5 + 0.5) * width),
          );
          const pixelY = Math.max(
            0,
            Math.min(height, (corner.y * 0.5 + 0.5) * height),
          );
          expect(pixelX).toBeGreaterThanOrEqual(bounds.x);
          expect(pixelX).toBeLessThanOrEqual(bounds.x + bounds.z);
          expect(pixelY).toBeGreaterThanOrEqual(bounds.y);
          expect(pixelY).toBeLessThanOrEqual(bounds.y + bounds.w);
        }
      }
    }
  },
);
