import {
  porchPillars,
  porchBeamPosition,
  porchBeamSize,
} from './exteriorLayout';
import { FinishedBox as Box } from './FinishedBox';

// A single veranda runs along both openings, with an unobstructed entry aisle.
export function EntryPorch() {
  return (
    <group>
      <Box
        position={[-4.05, -0.15, 0.65]}
        size={[2.7, 0.28, 8.5]}
        color="#796759"
      />
      {Array.from({ length: 24 }, (_, i) => (
        <Box
          key={i}
          position={[-4.05, 0, -3.42 + i * 0.35]}
          size={[2.68, 0.025, 0.33]}
          color={i % 3 ? '#897968' : '#756657'}
        />
      ))}
      {/* Pale painted columns and their square bases echo the reference porch. */}
      {porchPillars.map((z) => (
        <group key={z} position={[-5.13, 0, z]}>
          <Box
            position={[0, 0.12, 0]}
            size={[0.32, 0.24, 0.32]}
            color="#b9b8a5"
          />
          <mesh position={[0, 1.36, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.105, 0.14, 2.3, 16]} />
            <meshStandardMaterial color="#c4c2ad" roughness={0.8} />
          </mesh>
          <Box
            position={[0, 2.55, 0]}
            size={[0.32, 0.18, 0.32]}
            color="#c4c2ad"
          />
        </group>
      ))}
      <Box position={porchBeamPosition} size={porchBeamSize} color="#acae9e" />
      <Box
        position={[-4.05, 2.88, 0.65]}
        size={[2.95, 0.16, 8.8]}
        color="#777969"
      />
      {([-1.42, 4.3] as const).map((z, index) => {
        const length = index === 0 ? 3.65 : 0.6;
        return (
          <group key={z} position={[-5.13, 0, z]}>
            {[0.18, 0.88].map((y) => (
              <Box
                key={y}
                position={[0, y, 0]}
                size={[0.12, 0.09, length]}
                color="#b0b3a3"
              />
            ))}
            {Array.from({ length: index === 0 ? 18 : 3 }, (_, i) => (
              <Box
                key={i}
                position={[0, 0.53, -length / 2 + 0.12 + i * 0.2]}
                size={[0.045, 0.65, 0.045]}
                color="#bfc0ac"
              />
            ))}
          </group>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          position={[-5.48 - i * 0.35, -0.15 - i * 0.16, 2.706]}
          size={[0.4, 0.18, 1.65]}
          color="#805c4a"
        />
      ))}
      {/* Planetshine falls onto the veranda from the visible planet's direction.
          A 4 m radius ends at x=-3, outside the wall and both open apertures. */}
      <pointLight
        position={[-7, 3.6, -3.8]}
        color="#e4d4ab"
        intensity={55}
        distance={4}
        decay={2}
      />
    </group>
  );
}
