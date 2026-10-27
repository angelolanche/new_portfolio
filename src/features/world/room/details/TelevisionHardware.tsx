import { FinishedBox as Box } from '../../surfaces/FinishedBox';

// Local coordinates match the existing CRT shell; the screen aperture stays clear.
export function TelevisionHardware() {
  return (
    <group>
      <Box
        position={[0.515, 1.065, 0.365]}
        size={[0.15, 0.7, 0.018]}
        color="#343a34"
        surface="plastic"
        radius={0.012}
      />
      {[0.91, 1.14].map((y) => (
        <group key={y} position={[0.51, y, 0.402]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.014, 32]} />
            <meshStandardMaterial color="#424b43" roughness={0.48} />
          </mesh>
          <Box
            position={[0, 0.02, 0.01]}
            size={[0.004, 0.016, 0.004]}
            color="#e1cf9c"
            surface="plain"
            radius={0.001}
          />
          {Array.from({ length: 12 }, (_, i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
              <Box
                position={[0, 0.061, -0.02]}
                size={[0.003, i % 3 === 0 ? 0.012 : 0.006, 0.002]}
                color="#c1baa0"
                surface="plain"
                radius={0}
              />
              <Box
                position={[0, 0.04, 0.008]}
                size={[0.002, 0.006, 0.002]}
                color="#72796b"
                surface="plain"
                radius={0}
              />
            </group>
          ))}
        </group>
      ))}
      {/* Raised speaker ribs over a dark recessed baffle. */}
      <Box
        position={[0.51, 1.315, 0.38]}
        size={[0.12, 0.13, 0.012]}
        color="#101613"
        surface="plain"
        radius={0.008}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[0.51, 1.26 + i * 0.013, 0.39]}
          size={[0.11, 0.005, 0.01]}
          color="#646a5c"
          surface="plastic"
          radius={0.002}
        />
      ))}
      {/* Power switch, headphone socket and recessed fasteners. */}
      <Box
        position={[0.47, 0.665, 0.375]}
        size={[0.04, 0.022, 0.022]}
        color="#71766a"
        surface="plastic"
        radius={0.005}
      />
      <mesh position={[0.585, 0.665, 0.372]}>
        <torusGeometry args={[0.01, 0.003, 8, 20]} />
        <meshStandardMaterial
          color="#ada78d"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.585, 0.665, 0.37]}>
        <circleGeometry args={[0.008, 16]} />
        <meshStandardMaterial color="#090d0c" />
      </mesh>
      {[-0.585, 0.59].flatMap((x) =>
        [0.63, 1.445].map((y) => (
          <group key={`${x}-${y}`} position={[x, y, 0.354]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.004, 12]} />
              <meshStandardMaterial
                color="#8b8e7c"
                metalness={0.65}
                roughness={0.5}
              />
            </mesh>
            <Box
              position={[0, 0, 0.003]}
              size={[0.011, 0.002, 0.002]}
              color="#202723"
              surface="plain"
              radius={0}
            />
          </group>
        )),
      )}
      {/* Side vents and the join between the front moulding and rear shell. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * 0.621, 1.04, 0.17]}
            size={[0.004, 0.7, 0.007]}
            color="#111916"
            surface="plain"
            radius={0.001}
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Box
              key={i}
              position={[side * 0.626, 1.1, -0.22 + i * 0.028]}
              size={[0.004, 0.24, 0.009]}
              color="#0d1412"
              surface="plain"
              radius={0.002}
            />
          ))}
          <Box
            position={[side * 0.43, 0.6, 0]}
            size={[0.16, 0.04, 0.43]}
            color="#151c18"
            surface="plastic"
            radius={0.012}
          />
        </group>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <Box
          key={i}
          position={[-0.32 + i * 0.047, 1.496, -0.16]}
          size={[0.018, 0.004, 0.19]}
          color="#111815"
          surface="plain"
          radius={0.004}
        />
      ))}
      {/* Telescopic collars and rounded safety caps on the rabbit-ear antenna. */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[0, 1.5, -0.05]}
          rotation={[0, 0, side * 0.55]}
        >
          {[0.16, 0.36, 0.59].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.018, 16]} />
              <meshStandardMaterial
                color="#a4a797"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.607, 0]}>
            <sphereGeometry args={[0.013, 16, 10]} />
            <meshStandardMaterial
              color="#c8c8ad"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
