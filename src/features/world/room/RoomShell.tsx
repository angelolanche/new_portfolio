import { FinishedBox as Box } from '../surfaces/FinishedBox';
import { roomBounds, roomCeiling, windowWallSections } from './sceneLayout';

export function RoomShell() {
  const width = roomBounds.right - roomBounds.left;
  const depth = roomBounds.front - roomBounds.back;
  const centerX = (roomBounds.left + roomBounds.right) / 2;
  const centerZ = (roomBounds.back + roomBounds.front) / 2;

  return (
    <>
      {/* Opaque roof hides the exterior stars. No environment reflection or
            shadow casting here: preserve the approved room lighting below. */}
      <mesh position={roomCeiling.position}>
        <boxGeometry args={roomCeiling.size} />
        <meshStandardMaterial color="#080a0c" roughness={1} metalness={0} />
      </mesh>
      <Box
        position={[centerX, -0.1, centerZ]}
        size={[width, 0.2, depth]}
        color="#493329"
      />
      <Box
        position={[centerX, roomBounds.height / 2, roomBounds.back]}
        size={[width, roomBounds.height, 0.15]}
        color="#48473d"
        surface="plaster"
        radius={0}
      />
      {windowWallSections.map((section, index) => (
        <Box
          key={`window-wall-${index}`}
          {...section}
          color="#51453a"
          surface="plaster"
          radius={0}
        />
      ))}
      <Box
        position={[roomBounds.right, roomBounds.height / 2, centerZ]}
        size={[0.15, roomBounds.height, depth]}
        color="#51453a"
        surface="plaster"
        radius={0}
      />
      <Box
        position={[roomBounds.right - 0.11, 0.12, centerZ]}
        size={[0.12, 0.24, depth]}
        color="#2b211c"
      />
      <Box
        position={[centerX, 0.12, roomBounds.back + 0.12]}
        size={[width, 0.24, 0.12]}
        color="#2b211c"
      />
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          position={[-2.45 + i * 0.45, 0.003, 0.7]}
          size={[0.012, 0.008, 8.6]}
          color="#2c241e"
        />
      ))}
    </>
  );
}
