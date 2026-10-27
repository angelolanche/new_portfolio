import { BoxGeometry } from 'three';

/** Extrude the film's edge pixels into lines; stretch a central slice over the back. */
export function createVideoBlockGeometry(
  width: number,
  height: number,
  depth: number,
) {
  const geometry = new BoxGeometry(width, height, depth);
  const uv = geometry.getAttribute('uv');
  for (let vertex = 0; vertex < uv.count; vertex++) {
    const face = Math.floor(vertex / 4);
    const u = uv.getX(vertex);
    const v = uv.getY(vertex);
    if (face === 0 || face === 1) uv.setXY(vertex, face === 0 ? 1 : 0, v);
    else if (face === 2 || face === 3) uv.setXY(vertex, u, face === 2 ? 1 : 0);
    else if (face === 5) uv.setXY(vertex, 0.5 + (u - 0.5) * 0.002, v);
  }
  uv.needsUpdate = true;
  return geometry;
}
