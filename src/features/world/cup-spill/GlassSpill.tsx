import { spillSettings } from './spillSettings';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group, Mesh, Quaternion, Vector3, Vector2 } from 'three';
import { glassPosition } from '../room/sceneLayout';
import { openingDuration } from '../opening/cameraPath';
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
import { createSpillVisibility, type SpillPart } from './spillVisibility';

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
  const spillRef = useRef<Group>(null);
  const glassRef = useRef<Group>(null);
  const cupWaterRef = useRef<Mesh>(null);
  const streamRef = useRef<Mesh>(null);
  const surfaceRef = useRef<Mesh>(null);
  const cascadeRef = useRef<Mesh>(null);
  const simulationRef = useRef<TableWaterSimulation | null>(null);
  const visibility = useMemo(() => createSpillVisibility(), []);
  const lastRenderedTime = useRef<Record<SpillPart, number>>({
    cup: -1,
    surface: -1,
    stream: -1,
    cascade: -1,
  });
  const cupWaterGeometry = useMemo(() => new CupWaterGeometry(), []);
  const surfaceGeometry = useMemo(() => createTabletopWaterGeometry(), []);
  const streamGeometry = useMemo(() => createPouringWaterGeometry(), []);
  const cascadeGeometry = useMemo(() => createEdgeCascadeGeometry(), []);
  const yawRotation = useMemo(() => new Quaternion(), []);
  const spinRotation = useMemo(() => new Quaternion(), []);
  const upAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const tiltAxis = useMemo(() => new Vector3(0, 0, 1), []);
  useEffect(
    () => () => {
      cupWaterGeometry.dispose();
      surfaceGeometry.dispose();
      streamGeometry.dispose();
      cascadeGeometry.dispose();
    },
    [cupWaterGeometry, surfaceGeometry, streamGeometry, cascadeGeometry],
  );
  useFrame(({ camera }) => {
    // The room is fully covered by the television world after entry.
    if (elapsedRef.current >= openingDuration || !spillRef.current) return;
    simulationRef.current ??= new TableWaterSimulation();
    const simulation = simulationRef.current;
    simulation.advance(elapsedRef.current);
    const pose = sampleSpillMotion(simulation.time);
    spillRef.current.updateWorldMatrix(true, false);
    const visible = visibility.sample(
      camera,
      spillRef.current.matrixWorld,
      simulation,
      pose,
    );
    if (glassRef.current) glassRef.current.visible = visible.cup;
    if (surfaceRef.current) surfaceRef.current.visible = visible.surface;
    if (cascadeRef.current) cascadeRef.current.visible = visible.cascade;
    if (streamRef.current)
      streamRef.current.visible =
        visible.stream && simulation.dischargeRate > 0.00001;
    const needsUpdate = (part: SpillPart) => {
      if (!visible[part] || lastRenderedTime.current[part] === simulation.time)
        return false;
      lastRenderedTime.current[part] = simulation.time;
      return true;
    };
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
    if (simulation.remainingCupVolume > 1e-6 && needsUpdate('cup'))
      cupWaterGeometry.update(
        simulation.waterSurfaceHeight,
        pose.angle,
        pose.slosh,
        pose.spin,
      );
    if (cupWaterRef.current)
      cupWaterRef.current.visible = simulation.remainingCupVolume > 1e-6;
    if (needsUpdate('surface'))
      updateTabletopWaterMesh(surfaceGeometry, simulation);
    if (
      streamRef.current &&
      streamRef.current.visible &&
      needsUpdate('stream')
    ) {
      updatePouringWaterMesh(
        streamGeometry,
        streamRef.current,
        simulation,
        pose,
      );
    }
    if (needsUpdate('cascade'))
      updateEdgeCascadeMesh(cascadeGeometry, simulation);
  });
  return (
    <group ref={spillRef}>
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
          <WaterMaterial volume />
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
      <mesh ref={surfaceRef} geometry={surfaceGeometry}>
        <WaterMaterial surface puddle />
      </mesh>
      <mesh ref={streamRef} geometry={streamGeometry}>
        <WaterMaterial />
      </mesh>
      <mesh ref={cascadeRef} geometry={cascadeGeometry}>
        <WaterMaterial surface />
      </mesh>
    </group>
  );
}
