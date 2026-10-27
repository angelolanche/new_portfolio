import { FinishedBox as Box } from '../surfaces/FinishedBox';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector2 } from 'three';
import { tablePosition, tableRadius, phonePosition } from './sceneLayout';
import { sampleSpillMotion } from '../cup-spill/spillMotion';
import { GlassSpill } from '../cup-spill/GlassSpill';
import { RoomMaterial } from '../surfaces/RoomSurfaces';
import { PhoneCord, TableFinish } from './details/RoomFinishDetails';
import { PhoneDetails, TableLamp } from './details/TabletopDetails';
import { openingDuration } from '../opening/cameraPath';

export function AnimatedTable({
  elapsedRef,
}: {
  elapsedRef: RefObject<number>;
}) {
  const tableRef = useRef<Group>(null);
  const lastTime = useRef(-1);
  useFrame(() => {
    const time = elapsedRef.current;
    if (time === lastTime.current || time >= openingDuration) return;
    lastTime.current = time;
    if (tableRef.current)
      tableRef.current.position.x =
        tablePosition[0] + sampleSpillMotion(elapsedRef.current).jolt;
  });

  return (
    <group ref={tableRef} position={tablePosition}>
      <mesh position={[0, 0.79, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[tableRadius, tableRadius, 0.1, 48]} />
        <RoomMaterial color="#8d6343" />
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <latheGeometry
          args={[
            [
              [0.14, -0.37],
              [0.16, -0.32],
              [0.14, -0.27],
              [0.08, -0.2],
              [0.075, 0.15],
              [0.11, 0.24],
              [0.14, 0.3],
              [0.14, 0.37],
            ].map(([r, y]) => new Vector2(r, y)),
            24,
          ]}
        />
        <RoomMaterial color="#493020" />
      </mesh>
      <Box position={[0, 0.07, 0]} size={[1.1, 0.1, 0.15]} color="#493020" />
      <Box position={[0, 0.07, 0]} size={[0.15, 0.1, 1.1]} color="#493020" />
      <TableFinish />
      <group position={phonePosition} rotation={[0, -0.2, 0]}>
        <Box
          position={[0, 0.065, 0]}
          size={[0.48, 0.13, 0.36]}
          color="#474b3b"
          surface="plastic"
          radius={0.045}
        />
        <Box
          position={[0, 0.15, -0.08]}
          size={[0.38, 0.12, 0.14]}
          color="#3b4034"
          surface="plastic"
          radius={0.035}
        />
        <PhoneDetails />
        <Box
          position={[0, 0.25, -0.08]}
          size={[0.47, 0.08, 0.1]}
          color="#252d26"
          surface="plastic"
          radius={0.035}
        />
        {[-0.23, 0.23].map((x) => (
          <Box
            key={x}
            position={[x, 0.215, -0.055]}
            size={[0.12, 0.12, 0.17]}
            color="#252d26"
            surface="plastic"
            radius={0.04}
          />
        ))}
        <PhoneCord />
      </group>
      <group position={[-0.4, 0.84, -0.18]} rotation={[0, -0.12, 0]}>
        <Box
          position={[0, 0.012, 0]}
          size={[0.34, 0.024, 0.42]}
          color="#665640"
        />
        <Box
          position={[0, 0.032, 0.008]}
          size={[0.32, 0.022, 0.39]}
          color="#d6c9a3"
          surface="paper"
        />
        {[-0.11, -0.055, 0, 0.055, 0.11].map((x) => (
          <mesh
            key={x}
            position={[x, 0.047, -0.19]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.014, 0.003, 5, 10]} />
            <meshStandardMaterial
              color="#6c7066"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
      <group
        position={[-0.17, 0.858, -0.18]}
        rotation={[Math.PI / 2, 0, -0.14]}
      >
        <mesh>
          <cylinderGeometry args={[0.009, 0.009, 0.26, 8]} />
          <meshStandardMaterial color="#394954" />
        </mesh>
        <mesh position={[0, -0.145, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.009, 0.03, 8]} />
          <meshStandardMaterial color="#b5af98" />
        </mesh>
      </group>
      <TableLamp />
      <GlassSpill elapsedRef={elapsedRef} />
    </group>
  );
}
