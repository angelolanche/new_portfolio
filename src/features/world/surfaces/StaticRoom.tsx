import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Group } from 'three';
import { batchStaticRoom } from './staticRoomBatch';

// Children have fixed transforms/materials for the lifetime of the room.
export function StaticRoom({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    if (ref.current) return batchStaticRoom(ref.current);
  }, []);
  return <group ref={ref}>{children}</group>;
}
