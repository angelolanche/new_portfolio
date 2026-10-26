import { FinishedBox as Box } from '../FinishedBox';
import { Upholstery } from '../Upholstery';
import { RoomMaterial } from '../RoomSurfaces';
import {
  wovenChairPosition,
  wovenChairYaw,
  armchairPosition,
  armchairYaw,
  sofaPosition,
} from '../sceneLayout';

export function WovenChair() {
  return (
    <group position={wovenChairPosition} rotation={[0, wovenChairYaw, 0]}>
      <Box position={[0, 0.45, 0]} size={[0.56, 0.06, 0.54]} color="#765035" />
      <mesh
        position={[0, 0.487, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[0.46, 0.44]} />
        <RoomMaterial surface="cane" />
      </mesh>
      {[-0.24, 0.24].flatMap((x) =>
        [-0.22, 0.22].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, 0.22, z]}
            size={[0.05, 0.44, 0.05]}
            color="#765035"
          />
        )),
      )}
      {[-0.25, 0.25].map((x) => (
        <Box
          key={x}
          position={[x, 0.85, 0.24]}
          size={[0.055, 0.8, 0.055]}
          color="#765035"
        />
      ))}
      {[0.68, 1.22].map((y) => (
        <Box
          key={y}
          position={[0, y, 0.24]}
          size={[0.55, 0.06, 0.06]}
          color="#765035"
        />
      ))}
      <mesh position={[0, 0.95, 0.24]} castShadow receiveShadow>
        <planeGeometry args={[0.46, 0.49]} />
        <RoomMaterial surface="cane" />
      </mesh>
      <Box
        position={[0, 0.2, 0.22]}
        size={[0.5, 0.035, 0.035]}
        color="#765035"
      />
    </group>
  );
}
export function Armchair() {
  return (
    <group position={armchairPosition} rotation={[0, armchairYaw, 0]}>
      <Box
        position={[0, 0.36, 0]}
        size={[1.05, 0.4, 0.95]}
        color="#a78d73"
        surface="fabric"
        radius={0.09}
      />
      <Upholstery
        position={[0, 0.59, -0.05]}
        size={[0.76, 0.17, 0.74]}
        surface="fabric"
        color="#99866a"
      />
      <Upholstery
        position={[0, 0.9, 0.36]}
        size={[1.05, 0.85, 0.22]}
        surface="fabric"
        color="#8b775c"
        back
      />
      {[-0.48, 0.48].map((x) => (
        <Upholstery
          key={x}
          position={[x, 0.56, 0]}
          size={[0.26, 0.46, 0.94]}
          surface="fabric"
          color="#ad9274"
        />
      ))}
      {[-0.37, 0.37].flatMap((x) =>
        [-0.3, 0.3].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, 0.12, z]}
            size={[0.09, 0.24, 0.09]}
            color="#3e2a1f"
          />
        )),
      )}
    </group>
  );
}

export function Sofa() {
  return (
    <group position={sofaPosition}>
      <Box
        position={[0, 0.39, 0]}
        size={[2.8, 0.5, 1.05]}
        color="#ffffff"
        surface="floral"
        radius={0.12}
      />
      <Upholstery position={[0, 0.92, 0.39]} size={[2.8, 0.96, 0.4]} back />
      {[-1.35, 1.35].map((x) => (
        <Upholstery
          key={x}
          position={[x * 0.94, 0.64, 0]}
          size={[0.38, 0.63, 1.05]}
        />
      ))}
      {[-0.7, 0, 0.7].map((x) => (
        <Upholstery
          key={x}
          position={[x, 0.69, -0.06]}
          size={[0.67, 0.19, 0.75]}
        />
      ))}
      {[-1, 1].map((x) => (
        <Box
          key={x}
          position={[x, 0.12, 0]}
          size={[0.12, 0.24, 0.7]}
          color="#291d19"
        />
      ))}
    </group>
  );
}
