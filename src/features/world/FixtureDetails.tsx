import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';

export function FixtureArm() {
  const geometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0.025, 0, 0),
          new Vector3(0.11, -0.055, 0),
          new Vector3(0.23, -0.082, 0),
          new Vector3(0.315, -0.05, 0),
          new Vector3(0.34, 0.008, 0),
        ]),
        32,
        0.013,
        10,
        false,
      ),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#8c7045"
          metalness={0.72}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.34, -0.019, 0]}>
        <cylinderGeometry args={[0.052, 0.034, 0.025, 32]} />
        <meshStandardMaterial
          color="#80613b"
          metalness={0.68}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0.34, 0.005, 0]}>
        <cylinderGeometry args={[0.023, 0.026, 0.038, 24]} />
        <meshStandardMaterial
          color="#594a34"
          metalness={0.75}
          roughness={0.36}
        />
      </mesh>
      {[-0.008, 0.002, 0.012].map((y) => (
        <mesh key={y} position={[0.34, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.025, 0.002, 6, 24]} />
          <meshStandardMaterial
            color="#b19662"
            metalness={0.65}
            roughness={0.38}
          />
        </mesh>
      ))}
      {[-0.011, 0.158].map((y, i) => (
        <mesh key={y} position={[0.34, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.137 : 0.058, 0.004, 8, 48]} />
          <meshStandardMaterial
            color="#c4b28a"
            metalness={0.35}
            roughness={0.45}
          />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh
            key={i}
            position={[0.34 + Math.sin(a) * 0.096, 0.074, Math.cos(a) * 0.096]}
            rotation={[Math.cos(a) * 0.52, 0, -Math.sin(a) * 0.52]}
          >
            <cylinderGeometry args={[0.0015, 0.002, 0.14, 5]} />
            <meshStandardMaterial color="#bcb299" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function FixtureStemDetails() {
  return (
    <group>
      {[-0.045, -0.12, -0.32, -0.385].map((y, i) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry
            args={[i === 3 ? 0.069 : 0.033, i === 3 ? 0.054 : 0.029, 0.025, 32]}
          />
          <meshStandardMaterial
            color="#a58a56"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.405, 0]} scale={[0.068, 0.053, 0.068]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial
          color="#8c7045"
          metalness={0.65}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0, -0.464, 0]}>
        <sphereGeometry args={[0.021, 20, 12]} />
        <meshStandardMaterial
          color="#b09560"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}
