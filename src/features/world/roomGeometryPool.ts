import { createContext } from 'react';
import type { BufferGeometry } from 'three';

export const RoomGeometryPool = createContext<Map<
  string,
  BufferGeometry
> | null>(null);
