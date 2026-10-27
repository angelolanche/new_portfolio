import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { projects, type Project } from '../../../../content/projects';
import { createPlaqueText } from './plaqueText';
import { createPlaqueMaterial } from './plaqueMaterial';

function ProjectPlaque({
  project,
  index,
  plaquesRef,
  clockRef,
}: {
  project: Project;
  index: number;
  plaquesRef: RefObject<(Group | null)[]>;
  clockRef: RefObject<number>;
}) {
  const lettering = useMemo(() => createPlaqueText(project), [project]);
  const face = useMemo(
    () =>
      createPlaqueMaterial(lettering.texture, false, lettering.titleEffectTop),
    [lettering],
  );
  const timeUniformRef = useRef<{ value: number } | null>(null);
  useEffect(() => {
    timeUniformRef.current = face.time;
    return () => {
      timeUniformRef.current = null;
      lettering.texture.dispose();
      face.material.dispose();
    };
  }, [lettering, face]);
  useFrame(() => {
    if (timeUniformRef.current) timeUniformRef.current.value = clockRef.current;
  });
  return (
    <group
      ref={(group) => {
        plaquesRef.current[index] = group;
      }}
      visible={false}
      userData={{
        project: project.slug,
        width: lettering.width,
        height: lettering.height,
      }}
    >
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[lettering.width, lettering.height, 0.2]} />
        <meshBasicMaterial color="#e6e4dd" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.002]} material={face.material}>
        <planeGeometry args={[lettering.width, lettering.height]} />
      </mesh>
    </group>
  );
}

export function SignalPlaques({
  plaquesRef,
  clockRef,
}: {
  plaquesRef: RefObject<(Group | null)[]>;
  clockRef: RefObject<number>;
}) {
  return projects.map((project, index) => (
    <ProjectPlaque
      key={project.slug}
      project={project}
      index={index}
      plaquesRef={plaquesRef}
      clockRef={clockRef}
    />
  ));
}
