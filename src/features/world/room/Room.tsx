import { memo, type RefObject } from 'react';
import { StaticRoom } from '../StaticRoom';
import { RoomShell } from './RoomShell';
import { RoomDetails } from './RoomDetails';
import { Sofa } from './Seating';
import { TelevisionCabinet } from './TelevisionCabinet';
import { AnimatedTable } from './AnimatedTable';
import { CeilingFixture } from './CeilingFixture';
import { RoomLighting } from './RoomLighting';

export const Room = memo(function Room({
  elapsedRef,
}: {
  elapsedRef: RefObject<number>;
}) {
  return (
    <group>
      <CeilingFixture elapsedRef={elapsedRef} />
      <StaticRoom>
        <RoomShell />
        <RoomDetails />
        <Sofa />
        <TelevisionCabinet />
      </StaticRoom>
      <AnimatedTable elapsedRef={elapsedRef} />
      <RoomLighting />
    </group>
  );
});
