import { FinishedBox as Box } from '../FinishedBox';
import { televisionPosition } from '../sceneLayout';
import { TelevisionFinish } from '../RoomFinishDetails';
import { WallUnitUpper } from './WallUnitUpper';

export function TelevisionCabinet() {
  return (
    <group position={televisionPosition}>
      <WallUnitUpper />
      <Box position={[0, 0.82, 0]} size={[4.7, 0.16, 0.92]} color="#63422d" />
      <Box position={[0, 0.12, 0]} size={[4.6, 0.12, 0.85]} color="#453023" />
      <Box
        position={[0, 0.47, -0.38]}
        size={[4.6, 0.7, 0.07]}
        color="#30251d"
      />
      {[-2.25, -1.1, 0.7, 2.25].map((x) => (
        <Box
          key={x}
          position={[x, 0.47, 0]}
          size={[0.12, 0.7, 0.85]}
          color="#63422d"
        />
      ))}
      {/* Raised panel doors and brass handles give the cabinet more visual weight. */}
      {[-1.68, 1.5].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0.46, 0.44]}
            size={[1.02, 0.57, 0.08]}
            color="#73503a"
          />
          <Box
            position={[x, 0.46, 0.49]}
            size={[0.83, 0.39, 0.035]}
            color="#5c3e2c"
          />
          <Box
            position={[x + 0.34, 0.49, 0.53]}
            size={[0.035, 0.13, 0.045]}
            color="#b99b60"
          />
        </group>
      ))}
      <Box position={[-0.2, 0.43, 0]} size={[1.7, 0.07, 0.8]} color="#63422d" />
      <Box
        position={[0, 0.18, 0.47]}
        size={[4.6, 0.15, 0.09]}
        color="#533725"
      />
      <group position={[0, 0.28, 0]}>
        {/* VHS deck with cassette slot, display and buttons. */}
        <Box
          position={[-0.15, 0.05, 0.03]}
          size={[0.8, 0.15, 0.5]}
          color="#72746b"
          surface="plastic"
        />
        <Box
          position={[-0.29, 0.07, 0.288]}
          size={[0.34, 0.025, 0.015]}
          color="#171e1b"
        />
        <Box
          position={[0.09, 0.07, 0.29]}
          size={[0.16, 0.035, 0.02]}
          color="#67948a"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={i}
            position={[-0.95 + i * 0.1, 0.29, 0.18]}
            size={[0.065, 0.28 + (i % 3) * 0.02, 0.3]}
            color={['#706b4a', '#8e7155', '#4a5d56'][i % 3]}
            surface="paper"
          />
        ))}
        <Box
          position={[0, 1.04, 0]}
          size={[1.25, 0.91, 0.72]}
          color="#242b29"
          surface="plastic"
          radius={0.08}
        />
        <group position={[0, 1.5, -0.05]}>
          <mesh>
            <sphereGeometry args={[0.085, 12, 8]} />
            <meshStandardMaterial color="#333b36" />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} rotation={[0, 0, side * 0.55]}>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.007, 0.012, 0.6, 8]} />
                <meshStandardMaterial
                  color="#b3b8aa"
                  metalness={0.7}
                  roughness={0.35}
                />
              </mesh>
            </group>
          ))}
        </group>
        <mesh position={[-0.1, 1.06, 0.372]}>
          <boxGeometry args={[0.94, 0.67, 0.035]} />
          <meshBasicMaterial color="#81a5a0" />
        </mesh>
        <pointLight
          position={[0, 1.2, 0.8]}
          color="#99e1e6"
          intensity={8}
          distance={5}
        />
        <TelevisionFinish />
      </group>
    </group>
  );
}
