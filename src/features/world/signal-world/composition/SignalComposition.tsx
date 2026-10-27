import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group, Vector3 } from 'three';
import { projects } from '../../../../content/projects';
import type { SignalNavigation } from '../navigation/signalNavigation';
import { VideoWork } from '../media/VideoWork';
import { createSignalThreads } from './signalThreads';
import { signalCenterZ, projectBlockDepth } from '../signalLayout';
import { sampleFloat } from '../signalFloat';
import { SignalSun } from './SignalSun';

const threadColor = '#ed191c';
const signalForms = Array.from({ length: 146 }, (_, formIndex) => {
  const angle = formIndex * 2.39996;
  const radius = (18 + (formIndex % 8) * 4.5) * 1.65;
  const scale =
    formIndex < 110
      ? 0.25 + (formIndex % 5) * 0.2
      : 0.7 + (formIndex % 7) * 0.65;
  const position = new Vector3(
    Math.sin(angle) * radius,
    Math.sin(formIndex * 1.71) * (9 + (formIndex % 14)) * 1.4,
    Math.cos(angle) * radius,
  );
  // Keep the new large solids outside the films' floating envelopes.
  if (formIndex >= 110) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const overlaps = projects.some((project, index) => {
        const filmRadius =
          (Math.hypot(
            (5.5 * project.videos[0].width) / project.videos[0].height,
            5.5,
            projectBlockDepth(index) * 2,
          ) *
            project.scale) /
          2;
        return (
          Math.hypot(
            position.x - project.position[0],
            position.y - project.position[1],
            position.z + signalCenterZ - project.position[2],
          ) <
          1.8 * scale + filmRadius + 2
        );
      });
      if (!overlaps) break;
      position.y += (formIndex % 2 ? 1 : -1) * (8 + scale);
    }
  }
  return {
    position: [position.x, position.y, position.z] as const,
    rotation: [formIndex * 0.8, formIndex, formIndex * 0.3] as const,
    scale,
  };
});

export function SignalComposition({
  navigationRef,
  elapsedRef,
  playing,
  clockRef,
}: {
  navigationRef: RefObject<SignalNavigation>;
  elapsedRef: RefObject<number>;
  playing: boolean;
  clockRef: RefObject<number>;
}) {
  const floatingFormRefs = useRef<(Group | null)[]>([]);
  const floatPosition = useRef(new Vector3());
  const floatRotation = useRef(new Vector3());
  const threads = useMemo(() => createSignalThreads(), []);
  useEffect(() => () => threads.dispose(), [threads]);
  useFrame((_, delta) => {
    if (elapsedRef.current === 0) clockRef.current = 0;
    if (
      playing &&
      !navigationRef.current.detailOpen &&
      !navigationRef.current.reducedMotion
    )
      clockRef.current += Math.min(delta, 0.1);
    floatingFormRefs.current.forEach((object, formIndex) => {
      if (!object) return;
      const form = signalForms[formIndex];
      sampleFloat(
        clockRef.current,
        formIndex,
        formIndex < 110 ? 0.3 : 0.5,
        floatPosition.current,
        floatRotation.current,
      );
      object.position.set(...form.position).add(floatPosition.current);
      object.rotation.set(
        form.rotation[0] + floatRotation.current.x,
        form.rotation[1] + floatRotation.current.y,
        form.rotation[2] + floatRotation.current.z,
      );
    });
  }, -0.5);
  return (
    <group>
      <ambientLight intensity={0.9} />
      <directionalLight position={[18, 30, 12]} intensity={2.4} />
      <mesh geometry={threads}>
        <meshBasicMaterial color={threadColor} toneMapped={false} />
      </mesh>
      {projects.map((project) => (
        <VideoWork
          key={project.slug}
          project={project}
          navigationRef={navigationRef}
          elapsedRef={elapsedRef}
          playing={playing}
          clockRef={clockRef}
        />
      ))}
      {/* White forms are independent visual counterweights, never project proxies. */}
      <group position={[0, 0, signalCenterZ]}>
        {signalForms.map((form, formIndex) => {
          return (
            <group
              key={formIndex}
              ref={(object) => {
                floatingFormRefs.current[formIndex] = object;
              }}
              position={form.position}
              rotation={form.rotation}
              scale={form.scale}
            >
              {formIndex >= 110 ? (
                <mesh>
                  {formIndex % 6 === 0 ? (
                    <boxGeometry args={[2.2, 1.4, 1.8]} />
                  ) : formIndex % 6 === 1 ? (
                    <sphereGeometry args={[1, 16, 12]} />
                  ) : formIndex % 6 === 2 ? (
                    <coneGeometry args={[1.1, 2.6, 5]} />
                  ) : formIndex % 6 === 3 ? (
                    <cylinderGeometry args={[0.8, 1.1, 2.1, 8]} />
                  ) : formIndex % 6 === 4 ? (
                    <octahedronGeometry args={[1.4, 0]} />
                  ) : (
                    <tetrahedronGeometry args={[1.7, 0]} />
                  )}
                  <meshStandardMaterial
                    color="#fffdf1"
                    roughness={0.95}
                    flatShading
                  />
                </mesh>
              ) : (
                <mesh>
                  {formIndex % 5 === 0 ? (
                    <torusGeometry args={[1.6, 0.07, 5, 30, Math.PI * 1.7]} />
                  ) : formIndex % 5 === 1 ? (
                    <boxGeometry args={[0.16, 4, 0.16]} />
                  ) : formIndex % 5 === 2 ? (
                    <tetrahedronGeometry args={[1.4, 0]} />
                  ) : formIndex % 5 === 3 ? (
                    <planeGeometry args={[1.2, 3.8]} />
                  ) : (
                    <boxGeometry args={[3.2, 1.8, 0.08]} />
                  )}
                  <meshBasicMaterial
                    color="#fffdf1"
                    side={DoubleSide}
                    wireframe={formIndex % 5 === 2 || formIndex % 5 === 4}
                  />
                </mesh>
              )}
              {formIndex % 11 === 0 && (
                <mesh rotation={[0.8, 1.1, 0]}>
                  <torusGeometry args={[1.6, 0.07, 5, 30, Math.PI * 1.7]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              )}
              {formIndex % 13 === 0 && (
                <mesh position={[0.6, 0.4, -0.4]}>
                  <boxGeometry args={[0.4, 3.2, 0.2]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
      <SignalSun clockRef={clockRef} />
    </group>
  );
}
