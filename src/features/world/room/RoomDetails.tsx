import { FinishedBox as Box } from '../FinishedBox';
import { EntryDoor, SideWindow } from './RoomOpenings';
import { Armchair, WovenChair } from './Seating';
import { EntryPorch } from '../EntryPorch';
import { LivedInDetails } from '../LivedInDetails';
import { DetailedPlant, TelevisionLamp } from '../RoomBotanicalDetails';
import { LampSideTable } from '../ShelfKeepsakes';

export function RoomDetails() {
  return (
    <group>
      <SideWindow />
      <LivedInDetails />
      <EntryDoor />
      <Armchair />
      <WovenChair />
      <EntryPorch />
      <DetailedPlant
        position={[3.53, 0, -2.82]}
        scale={[0.95, 1.2, 0.95]}
        potColor="#71634c"
      />
      <DetailedPlant
        position={[2.69, 0.9, -2.85]}
        scale={0.3}
        potColor="#79644d"
      />
      {/* Layered rectangles suggest a woven border without adding texture assets. */}
      <Box
        position={[0.1, 0.025, -0.45]}
        size={[4.8, 0.035, 3.8]}
        color="#755341"
        surface="rug"
      />
      <Box
        position={[0.1, 0.047, -0.45]}
        size={[4.55, 0.008, 3.55]}
        color="#b19a70"
        surface="fabric"
      />
      <Box
        position={[0.1, 0.054, -0.45]}
        size={[4.35, 0.008, 3.35]}
        color="#604d48"
        surface="rug"
      />
      {[-1.35, -0.6, 0.15, 0.9, 1.65].map((x) => (
        <mesh
          key={x}
          position={[x, 0.061, -0.45]}
          rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        >
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial color="#9b8967" />
        </mesh>
      ))}
      {/* Picture frames and simple abstract inserts, rather than invented family photos. */}
      {[
        [-1.7, 2.15, 0.65, 0.8],
        [0.1, 2.45, 1, 0.55],
        [1.65, 2.05, 0.65, 0.85],
      ].map(([x, y, width, height]) => (
        <group key={x}>
          <Box
            position={[x, y, -3.47]}
            size={[width, height, 0.07]}
            color="#392b22"
          />
          <Box
            position={[x, y, -3.42]}
            size={[width - 0.09, height - 0.09, 0.025]}
            color="#ad9b7c"
          />
          <Box
            position={[x, y, -3.4]}
            size={[width * 0.55, height * 0.48, 0.015]}
            color="#576052"
          />
        </group>
      ))}
      <group position={[-2.3, 0, -2.1]}>
        <LampSideTable />
        <TelevisionLamp />
        <pointLight
          position={[0, 1.25, 0.15]}
          color="#ffc17a"
          intensity={9}
          distance={5}
        />
      </group>
    </group>
  );
}
