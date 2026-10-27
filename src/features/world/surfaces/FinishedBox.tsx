import { useContext, useEffect, useMemo } from 'react';
import { RoomGeometryPool } from './roomGeometryPool';
import { createFinishedBox } from './finishedGeometry';
import { RoomMaterial, type Surface } from './RoomSurfaces';

export function FinishedBox({
  position,
  size,
  color,
  surface = 'wood',
  radius = 0.012,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  surface?: Surface;
  radius?: number;
}) {
  const [w, h, d] = size;
  const pool = useContext(RoomGeometryPool);
  const geometry = useMemo(() => {
    const key = `${w}/${h}/${d}/${radius}`;
    const cached = pool?.get(key);
    if (cached) return cached;
    const next = createFinishedBox([w, h, d], radius);
    pool?.set(key, next);
    return next;
  }, [w, h, d, radius, pool]);
  useEffect(
    () => () => {
      if (!pool) geometry.dispose();
    },
    [geometry, pool],
  );
  return (
    <mesh position={position} geometry={geometry} castShadow receiveShadow>
      <RoomMaterial surface={surface} color={color} closed />
    </mesh>
  );
}
