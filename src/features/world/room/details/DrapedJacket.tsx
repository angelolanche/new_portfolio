import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';
import bakedJacketData from 'virtual:baked-jacket';
import { restoreBakedJacketModel } from './bakedJacket';
import { armchairPosition, armchairYaw } from '../sceneLayout';

export function DrapedJacket() {
  const model = useMemo(() => restoreBakedJacketModel(bakedJacketData), []);
  const collarStartIndex = model.torso.length + model.sleeves.length;
  useEffect(
    () => () => {
      [
        ...model.torso,
        ...model.sleeves,
        ...model.collar,
        ...model.seams,
        model.pocket,
      ].forEach((geometry) => geometry.dispose());
    },
    [model],
  );
  return (
    <group position={armchairPosition} rotation={[0, armchairYaw, 0]}>
      {[...model.torso, ...model.sleeves, ...model.collar, model.pocket].map(
        (geometry, meshIndex) => (
          <mesh key={meshIndex} geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={meshIndex >= collarStartIndex ? '#566574' : '#45566a'}
              roughness={0.94}
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
      {model.seams.map((geometry, meshIndex) => (
        <mesh key={meshIndex} geometry={geometry}>
          <meshStandardMaterial color="#7d8790" roughness={1} />
        </mesh>
      ))}
      {model.zipper.map((zipperPosition, meshIndex) => (
        <mesh key={meshIndex} position={zipperPosition}>
          <sphereGeometry args={[0.0019, 6, 4]} />
          <meshStandardMaterial
            color="#9b9d94"
            metalness={0.5}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}
