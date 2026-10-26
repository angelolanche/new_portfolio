import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createFinishedBox(
  size: [number, number, number],
  radius: number,
) {
  const geometry = new RoundedBoxGeometry(
    ...size,
    radius >= 0.04 ? 4 : 1,
    Math.min(radius, Math.min(...size) * 0.45),
  );
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  // Meter-based projection keeps the fabric pattern at the same scale on all parts.
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i)),
      ny = Math.abs(normal.getY(i)),
      nz = Math.abs(normal.getZ(i));
    const u = nx > nz && nx > ny ? position.getZ(i) : position.getX(i);
    const v = ny > nx && ny > nz ? position.getZ(i) : position.getY(i);
    uv.setXY(i, u * 1.4, v * 1.4);
  }
  return geometry;
}
