import { createContext, useContext } from 'react';
import type { CanvasTexture } from 'three';
import type { Surface } from './RoomSurfaces';

export const RoomSurfaceContext = createContext<{
  maps: Partial<Record<Surface, CanvasTexture>>;
  weave?: CanvasTexture;
  reflection?: CanvasTexture;
}>({ maps: {} });

export function useRoomReflection() {
  return useContext(RoomSurfaceContext).reflection;
}
