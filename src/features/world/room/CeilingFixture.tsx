import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group, PointLight, MeshStandardMaterial } from 'three';
import { useFixtureShade } from '../fixtureShade';
import { FixtureArm, FixtureStemDetails } from '../FixtureDetails';
import { sampleFixtureSwing } from '../fixtureMotion';
import { sampleFixtureIntensity } from '../fixtureLight';
import { openingDuration } from '../cameraPath';

export function CeilingFixture({
  elapsedRef,
}: {
  elapsedRef: RefObject<number>;
}) {
  const shadeGeometry = useFixtureShade();
  const hangingFixture = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const bulb = useRef<MeshStandardMaterial>(null);
  const shade = useRef<MeshStandardMaterial>(null);
  const lastTime = useRef(-1);
  useFrame(() => {
    const time = elapsedRef.current;
    if (time === lastTime.current || time >= openingDuration) return;
    lastTime.current = time;
    const intensity = sampleFixtureIntensity(elapsedRef.current);
    if (hangingFixture.current)
      hangingFixture.current.rotation.z = sampleFixtureSwing(
        elapsedRef.current,
      );
    if (light.current) light.current.intensity = intensity * 16;
    if (bulb.current) bulb.current.emissiveIntensity = intensity * 3;
    if (shade.current) shade.current.emissiveIntensity = intensity * 0.8;
  });
  return (
    <group position={[0.1, 3.15, -0.3]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.06, 40]} />
        <meshStandardMaterial color="#8c7045" metalness={0.6} roughness={0.6} />
      </mesh>
      <group ref={hangingFixture}>
        <FixtureStemDetails />
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.36, 8]} />
          <meshStandardMaterial
            color="#8c7045"
            metalness={0.6}
            roughness={0.6}
          />
        </mesh>
        {/* Only one warm bulb is powered; brief, irregular contact failures. */}
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            position={[0, -0.4, 0]}
            rotation={[0, (i * Math.PI * 2) / 3, 0]}
          >
            <FixtureArm />
            <mesh position={[0.34, 0.07, 0]} geometry={shadeGeometry}>
              <meshStandardMaterial
                ref={i === 0 ? shade : undefined}
                emissive={i === 0 ? '#ffb85e' : '#000000'}
                color="#b3ac95"
                roughness={0.65}
                side={DoubleSide}
              />
            </mesh>
            {i === 0 && (
              <pointLight
                ref={light}
                position={[0.34, 0.08, 0]}
                color="#ffd39a"
                distance={7}
                decay={2}
              />
            )}
            <mesh position={[0.34, 0.055, 0]}>
              <sphereGeometry args={[0.035, 24, 16]} />
              <meshStandardMaterial
                ref={i === 0 ? bulb : undefined}
                color="#c6bfa9"
                emissive={i === 0 ? '#ffd18c' : '#000000'}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
