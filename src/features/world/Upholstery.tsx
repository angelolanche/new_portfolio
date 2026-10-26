import { useEffect, useMemo } from 'react';
import { createFinishedBox } from './finishedGeometry';
import { RoomMaterial, type Surface } from './RoomSurfaces';

// Keep the existing furniture envelope, but soften shoulders and crown the
// cushions. Meter-based UVs retain the same print scale across all panels.
export function Upholstery({
  position,
  size,
  color = '#ffffff',
  surface = 'floral',
  back = false,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  surface?: Surface;
  back?: boolean;
}) {
  const [w, h, d] = size;
  const geometry = useMemo(() => {
    const result = createFinishedBox([w, h, d], Math.min(h, d) * 0.42);
    const p = result.getAttribute('position');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const across = Math.min(1, Math.abs(x / (w / 2)));
      if (back) {
        // Arched top and tapered shoulders, instead of a rectangular slab.
        p.setY(i, y - h * 0.2 * across ** 3 * (y / h + 0.5));
        p.setX(i, x * (1 - 0.035 * (y / h + 0.5)));
      } else {
        // Compress the perimeter while leaving the center softly upholstered.
        const edge = Math.max(across, Math.abs(z / (d / 2)));
        p.setY(i, y * (1 - 0.23 * edge ** 2));
      }
    }
    result.computeVertexNormals();
    return result;
  }, [w, h, d, back]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position} geometry={geometry} castShadow receiveShadow>
      <RoomMaterial surface={surface} color={color} />
    </mesh>
  );
}
