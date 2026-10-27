import { Vector3, Vector4, type PerspectiveCamera } from 'three';
import { televisionScreenCenter } from './televisionWorld';

/** Reusable scratch storage; bounds use physical drawing-buffer pixels. */
export function createTelevisionRenderBounds() {
  const corner = new Vector3();
  const bounds = new Vector4();
  return (camera: PerspectiveCamera, width: number, height: number) => {
    let left = width;
    let bottom = height;
    let right = 0;
    let top = 0;
    for (const x of [-0.47, 0.47]) {
      for (const y of [-0.335, 0.335]) {
        corner.copy(televisionScreenCenter);
        corner.x += x;
        corner.y += y;
        corner.project(camera);
        // Crossing the near plane requires the full viewport, avoiding clipped entry.
        if (corner.z <= -1 || corner.z >= 1)
          return bounds.set(0, 0, width, height);
        const pixelX = (corner.x * 0.5 + 0.5) * width;
        const pixelY = (corner.y * 0.5 + 0.5) * height;
        left = Math.min(left, pixelX);
        right = Math.max(right, pixelX);
        bottom = Math.min(bottom, pixelY);
        top = Math.max(top, pixelY);
      }
    }
    // Padding covers raster edges without changing the CRT's projection or grain.
    left = Math.max(0, Math.floor(left) - 2);
    bottom = Math.max(0, Math.floor(bottom) - 2);
    right = Math.min(width, Math.ceil(right) + 2);
    top = Math.min(height, Math.ceil(top) + 2);
    return bounds.set(
      left,
      bottom,
      Math.max(0, right - left),
      Math.max(0, top - bottom),
    );
  };
}
