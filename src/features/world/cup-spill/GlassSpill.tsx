import { spillSettings } from './spillSettings';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
  Vector2,
} from 'three';
import { glassPosition } from '../sceneLayout';
import { openingDuration } from '../cameraPath';
import { sampleSpillMotion } from './spillMotion';
import { CupWaterGeometry } from './CupWaterGeometry';
import { TableWaterSimulation } from './tableWater';
import { WaterMaterial } from './WaterMaterial';
import {
  createTabletopWaterGeometry,
  updateTabletopWaterMesh,
} from './tabletopWaterMesh';
import {
  createPouringWaterGeometry,
  updatePouringWaterMesh,
} from './pouringWaterMesh';
import {
  createEdgeCascadeGeometry,
  updateEdgeCascadeMesh,
} from './edgeCascadeMesh';
import {
  createDetachedWaterGeometry,
  updateFallingDroplets,
} from './fallingDroplets';

function createGlassProfile() {
  return [
    new Vector2(0, 0),
    new Vector2(0.085, 0),
    new Vector2(0.106, 0.42),
    new Vector2(0.1, 0.42),
    new Vector2(0.079, 0.012),
    new Vector2(0, 0.012),
  ].map(
    (point) =>
      new Vector2(
        point.x * spillSettings.cup.radiusScale,
        point.y * spillSettings.cup.heightScale,
      ),
  );
}

export function GlassSpill({ elapsedRef }: { elapsedRef: RefObject<number> }) {
  const glassProfile = useMemo(() => createGlassProfile(), []);
  const glassRef = useRef<Group>(null);
  const cupWaterRef = useRef<Mesh>(null);
  const streamRef = useRef<Mesh>(null);
  const dropletsRef = useRef<InstancedMesh>(null);
  const simulationRef = useRef<TableWaterSimulation | null>(null);
  const lastRenderedTimeRef = useRef(-1);
  const cupWaterGeometry = useMemo(() => new CupWaterGeometry(), []);
  const surfaceGeometry = useMemo(() => createTabletopWaterGeometry(), []);
  const streamGeometry = useMemo(() => createPouringWaterGeometry(), []);
  const detachedGeometry = useMemo(() => createDetachedWaterGeometry(), []);
  const cascadeGeometry = useMemo(() => createEdgeCascadeGeometry(), []);
  const yawRotation = useMemo(() => new Quaternion(), []);
  const spinRotation = useMemo(() => new Quaternion(), []);
  const upAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const tiltAxis = useMemo(() => new Vector3(0, 0, 1), []);
  const dropletTransform = useMemo(() => new Object3D(), []);
  useEffect(
    () => () => {
      cupWaterGeometry.dispose();
      surfaceGeometry.dispose();
      streamGeometry.dispose();
      cascadeGeometry.dispose();
      detachedGeometry.dispose();
    },
    [
      cupWaterGeometry,
      surfaceGeometry,
      streamGeometry,
      cascadeGeometry,
      detachedGeometry,
    ],
  );
  useFrame(() => {
    // The room is fully covered by the television world. Replay still seeks
    // backwards through advance(), restoring the exact deterministic state.
    if (elapsedRef.current >= openingDuration) return;
    simulationRef.current ??= new TableWaterSimulation();
    const simulation = simulationRef.current;
    simulation.advance(elapsedRef.current);
    if (lastRenderedTimeRef.current === simulation.time) return;
    lastRenderedTimeRef.current = simulation.time;
    const pose = sampleSpillMotion(simulation.time);
    if (glassRef.current) {
      glassRef.current.quaternion
        .setFromAxisAngle(tiltAxis, pose.angle)
        .premultiply(yawRotation.setFromAxisAngle(upAxis, pose.yaw))
        .multiply(spinRotation.setFromAxisAngle(upAxis, -pose.spin));
      glassRef.current.position.set(
        pose.x,
        glassPosition[1] + pose.lift,
        pose.z,
      );
    }
    cupWaterGeometry.update(
      simulation.waterSurfaceHeight,
      pose.angle,
      pose.slosh,
      pose.spin,
    );
    if (cupWaterRef.current)
      cupWaterRef.current.visible = simulation.remainingCupVolume > 1e-6;
    updateTabletopWaterMesh(surfaceGeometry, simulation);
    if (streamRef.current) {
      updatePouringWaterMesh(
        streamGeometry,
        streamRef.current,
        simulation,
        pose,
      );
    }
    updateEdgeCascadeMesh(cascadeGeometry, simulation);
    if (dropletsRef.current) {
      updateFallingDroplets(dropletsRef.current, dropletTransform, simulation);
    }
  });
  return (
    <>
      <group ref={glassRef} position={glassPosition}>
        <mesh>
          <latheGeometry args={[glassProfile, 48]} />
          <meshPhysicalMaterial
            color="#ecf4e9"
            transparent
            opacity={spillSettings.appearance.glassOpacity}
            depthWrite={false}
            specularIntensity={1.4}
            thickness={0.006}
            ior={1.5}
            roughness={spillSettings.appearance.glassRoughness}
            clearcoat={1}
            side={DoubleSide}
          />
        </mesh>
        <mesh ref={cupWaterRef} geometry={cupWaterGeometry}>
          <WaterMaterial />
        </mesh>
        <mesh
          position={[0, 0.418 * spillSettings.cup.heightScale, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[
              0.103 * spillSettings.cup.radiusScale,
              0.003 * spillSettings.cup.radiusScale,
              8,
              48,
            ]}
          />
          <meshPhysicalMaterial
            color="#cfddd6"
            transmission={0.65}
            roughness={0.1}
            thickness={0.004}
          />
        </mesh>
      </group>
      <mesh geometry={surfaceGeometry} frustumCulled={false}>
        <WaterMaterial surface puddle />
      </mesh>
      <mesh ref={streamRef} geometry={streamGeometry} frustumCulled={false}>
        <WaterMaterial />
      </mesh>
      <mesh geometry={cascadeGeometry} frustumCulled={false}>
        <WaterMaterial surface />
      </mesh>
      <instancedMesh
        ref={dropletsRef}
        args={[
          undefined,
          undefined,
          spillSettings.droplets.maximumVisibleCount,
        ]}
        frustumCulled={false}
      >
        <primitive object={detachedGeometry} attach="geometry" />
        <WaterMaterial />
      </instancedMesh>
    </>
  );
}
