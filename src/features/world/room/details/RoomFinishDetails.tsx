import { TelevisionHardware } from './TelevisionHardware';
import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { FinishedBox } from '../../surfaces/FinishedBox';
import { tableRadius } from '../sceneLayout';

function Cord({
  points,
  radius,
  color,
  closed = false,
}: {
  points: Vector3[];
  radius: number;
  color: string;
  closed?: boolean;
}) {
  const geometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3(points, closed),
        Math.min(220, points.length * 3),
        radius,
        5,
        closed,
      ),
    [points, radius, closed],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}

export function PhoneCord() {
  const points = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => {
        const t = i / 149,
          coil = t * Math.PI * 2 * 24;
        return new Vector3(
          -0.24 - Math.sin(t * Math.PI) * 0.045 + Math.cos(coil) * 0.009,
          0.19 - Math.sin(t * Math.PI) * 0.17 + Math.sin(coil) * 0.009,
          -0.08 + t * 0.22,
        );
      }),
    [],
  );
  return <Cord points={points} radius={0.003} color="#242e29" />;
}

export function TelevisionFinish() {
  return (
    <group>
      <TelevisionHardware />
      <mesh position={[-0.1, 1.06, 0.385]} scale={[0.47, 0.335, 0.032]}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshPhysicalMaterial
          color="#a6c7bd"
          roughness={0.35}
          clearcoat={0.3}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
      {[-0.595, 0.405].map((x) => (
        <FinishedBox
          key={x}
          position={[x, 1.06, 0.393]}
          size={[0.065, 0.75, 0.04]}
          color="#555b51"
          surface="plastic"
          radius={0.018}
        />
      ))}
      {[0.705, 1.415].map((y) => (
        <FinishedBox
          key={y}
          position={[-0.095, y, 0.393]}
          size={[1.02, 0.05, 0.04]}
          color="#555b51"
          surface="plastic"
          radius={0.016}
        />
      ))}
      {[0.91, 1.14].map((y) => (
        <mesh
          key={y}
          position={[0.51, y, 0.383]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.045, 0.045, 0.024, 20]} />
          <meshStandardMaterial
            color="#8d9588"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <FinishedBox
          key={i}
          position={[0.51, 0.75 + i * 0.017, 0.368]}
          size={[0.12, 0.005, 0.006]}
          color="#101814"
          surface="plain"
          radius={0}
        />
      ))}
      <mesh position={[0.54, 0.67, 0.37]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshBasicMaterial color="#bd6b4f" />
      </mesh>
    </group>
  );
}

export function TableFinish() {
  return (
    <group>
      {[0.756, 0.81].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[tableRadius - 0.006, 0.007, 6, 80]} />
          <meshStandardMaterial color="#bb8c58" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.16, 0.1, 0.13, 24]} />
        <meshStandardMaterial color="#6a442c" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function LampPleats() {
  return (
    <group>
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.196, 0.53, Math.sin(a) * 0.196]}
            rotation={[0, -a, 0.3]}
          >
            <cylinderGeometry args={[0.0012, 0.0018, 0.3, 4]} />
            <meshStandardMaterial
              color="#d3b583"
              roughness={1}
              emissive="#b18a56"
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
      {[0.385, 0.675].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.15 : 0.24, 0.005, 5, 48]} />
          <meshStandardMaterial color="#806039" />
        </mesh>
      ))}
    </group>
  );
}
