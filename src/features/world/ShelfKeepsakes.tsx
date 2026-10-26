import { Vector2 } from 'three';
import { FinishedBox as Box } from './FinishedBox';
import { RoomMaterial } from './RoomSurfaces';

export function LampSideTable() {
  return (
    <group>
      <Box
        position={[0, 0.7, 0]}
        size={[0.65, 0.07, 0.6]}
        color="#75503a"
        radius={0.025}
      />
      <Box
        position={[0, 0.655, 0]}
        size={[0.59, 0.025, 0.54]}
        color="#a17a51"
        radius={0.008}
      />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}-${z}`} position={[x * 0.245, 0, z * 0.22]}>
            <mesh position={[0, 0.325, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.038, 0.025, 0.63, 8]} />
              <RoomMaterial color="#68462f" surface="wood" />
            </mesh>
            <Box
              position={[0, 0.025, 0]}
              size={[0.063, 0.05, 0.063]}
              color="#3c2c21"
              radius={0.008}
            />
            {[0.51, 0.55].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.035, 0.004, 6, 16]} />
                <RoomMaterial color="#b28b5c" surface="wood" />
              </mesh>
            ))}
          </group>
        )),
      )}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[0, 0.595, side * 0.22]}
            size={[0.49, 0.105, 0.035]}
            color="#68462f"
          />
          <Box
            position={[side * 0.245, 0.595, 0]}
            size={[0.035, 0.105, 0.44]}
            color="#68462f"
          />
          <Box
            position={[side * 0.245, 0.17, 0]}
            size={[0.032, 0.045, 0.44]}
            color="#775239"
          />
        </group>
      ))}
      <Box
        position={[0, 0.17, 0]}
        size={[0.49, 0.045, 0.032]}
        color="#775239"
      />
      <Box
        position={[0, 0.595, 0.244]}
        size={[0.36, 0.072, 0.018]}
        color="#90653f"
        radius={0.006}
      />
      <mesh position={[0, 0.595, 0.265]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.018, 0.004, 8, 20]} />
        <meshStandardMaterial
          color="#b49a60"
          metalness={0.75}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

const jarProfile = [
  [0, 0],
  [0.065, 0],
  [0.075, 0.015],
  [0.072, 0.04],
  [0.095, 0.095],
  [0.085, 0.15],
  [0.047, 0.19],
  [0.047, 0.21],
  [0.04, 0.21],
  [0.04, 0.19],
].map(([x, y]) => new Vector2(x, y));

function PaintedJar({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[jarProfile, 32]} />
        <meshStandardMaterial color="#e1d7bb" roughness={0.22} />
      </mesh>
      {[0.035, 0.17, 0.208].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[i === 0 ? 0.073 : i === 1 ? 0.068 : 0.047, 0.004, 6, 32]}
          />
          <meshStandardMaterial color={color} roughness={0.26} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <mesh
            position={[0, 0.105, 0.092]}
            scale={[0.012, 0.028, 0.003]}
            rotation={[0, 0, 0.4]}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.218, 0]}>
        <sphereGeometry
          args={[0.052, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.275, 0]}>
        <sphereGeometry args={[0.012, 12, 8]} />
        <meshStandardMaterial color="#b29659" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PorcelainBird({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.014, 0]} scale={[1, 1, 0.7]}>
        <cylinderGeometry args={[0.1, 0.11, 0.028, 24]} />
        <meshStandardMaterial color="#b6a180" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]} scale={[0.095, 0.07, 0.055]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      <mesh position={[0.065, 0.17, 0]}>
        <sphereGeometry args={[0.042, 20, 14]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      <mesh position={[0.108, 0.169, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.014, 0.045, 12]} />
        <meshStandardMaterial color="#b78a50" roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0.077, 0.183, side * 0.032]}>
            <sphereGeometry args={[0.005, 10, 8]} />
            <meshStandardMaterial color="#24262a" roughness={0.18} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[-0.015 - i * 0.012, 0.105 - i * 0.012, side * 0.049]}
              rotation={[0, 0, -0.35]}
              scale={[0.065, 0.013, 0.009]}
            >
              <sphereGeometry args={[1, 16, 10]} />
              <meshStandardMaterial color="#e5ddc5" roughness={0.25} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh
        position={[-0.09, 0.11, 0]}
        rotation={[0, 0, 0.7]}
        scale={[0.065, 0.023, 0.028]}
      >
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function ShelfKeepsakes() {
  return (
    <group>
      {([-0.65, 0.52, 0.77] as const).map((x, i) => (
        <group key={x} position={[x, 2.525, 0.12]} scale={i === 2 ? 0.75 : 1}>
          <PaintedJar color={i === 1 ? '#8a6357' : '#536b7c'} />
        </group>
      ))}
      {(
        [
          [-1.4, 1.525, 0.15],
          [1.48, 2.625, 0.16],
          [-1.15, 2.625, 0.15],
        ] as const
      ).map((position, i) => (
        <group
          key={i}
          position={[...position]}
          rotation={[0, i === 1 ? -0.4 : 0.3, 0]}
        >
          <PorcelainBird color={i === 1 ? '#8b9b8d' : '#9a7a65'} />
        </group>
      ))}
      {/* Small brass armillary: nested inclined rings and a supported globe. */}
      <group position={[1.83, 1.525, 0.26]} scale={0.85}>
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.036, 32]} />
          <meshStandardMaterial color="#594538" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <cylinderGeometry args={[0.018, 0.03, 0.13, 16]} />
          <meshStandardMaterial
            color="#ad915b"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, 0.23, 0]}
            rotation={[i * 0.85, 0, i * 0.6]}
          >
            <torusGeometry args={[0.125 + i * 0.008, 0.006, 8, 40]} />
            <meshStandardMaterial
              color="#b49760"
              metalness={0.72}
              roughness={0.3}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.23, 0]}>
          <sphereGeometry args={[0.047, 24, 16]} />
          <meshStandardMaterial color="#71858a" roughness={0.28} />
        </mesh>
      </group>
    </group>
  );
}
