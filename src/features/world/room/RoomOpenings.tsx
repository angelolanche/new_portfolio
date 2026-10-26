import { FinishedBox as Box } from '../FinishedBox';
import {
  entryDoorPosition,
  entryDoorScale,
  sideWindowPosition,
  sideWindowScale,
} from '../sceneLayout';
import { WindowSpace } from '../WindowSpace';

export function EntryDoor() {
  return (
    <group
      position={entryDoorPosition}
      scale={entryDoorScale}
      rotation={[0, Math.PI / 2, 0]}
    >
      {[-0.49, 0.49].map((x) => (
        <Box
          key={x}
          position={[x, 1.13, 0.06]}
          size={[0.07, 2.26, 0.1]}
          color="#8d6c49"
        />
      ))}
      <Box
        position={[0, 2.27, 0.06]}
        size={[1.05, 0.09, 0.1]}
        color="#8d6c49"
      />
      <Box
        position={[0, 0.025, 0.06]}
        size={[0.94, 0.05, 0.14]}
        color="#453a2c"
      />
      <group position={[-0.45, 0, 0]} rotation={[0, Math.PI * 0.54, 0]}>
        <group position={[0.45, 0, 0]}>
          <Box position={[0, 1.1, 0]} size={[0.9, 2.2, 0.06]} color="#6e5039" />
          {[-0.21, 0.21].flatMap((x) =>
            [0.57, 1.6].map((y) => (
              <group key={`${x}-${y}`}>
                <Box
                  position={[x, y, 0.038]}
                  size={[0.34, 0.79, 0.025]}
                  color="#896547"
                />
                <Box
                  position={[x, y, 0.055]}
                  size={[0.26, 0.69, 0.012]}
                  color="#71513a"
                />
              </group>
            )),
          )}
          <mesh position={[0.32, 1.06, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.015, 12]} />
            <meshStandardMaterial
              color="#a48c59"
              metalness={0.55}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0.32, 1.06, 0.14]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial
              color="#a48c59"
              metalness={0.55}
              roughness={0.5}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
export function SideWindow() {
  return (
    <group
      position={sideWindowPosition}
      scale={sideWindowScale}
      rotation={[0, Math.PI / 2, 0]}
    >
      <WindowSpace />
      {[-0.84, 0, 0.84].map((x) => (
        <Box
          key={x}
          position={[x, 0, 0.08]}
          size={[0.055, 1.9, 0.06]}
          color="#8e8065"
        />
      ))}
      <Box position={[0, 0, 0.08]} size={[1.75, 0.045, 0.06]} color="#8e8065" />
      <Box
        position={[0, -0.98, 0.12]}
        size={[1.95, 0.09, 0.23]}
        color="#70553c"
      />
    </group>
  );
}
