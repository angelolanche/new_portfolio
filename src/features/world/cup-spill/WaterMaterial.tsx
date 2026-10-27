import { spillSettings } from './spillSettings';
import { DoubleSide } from 'three';
import { useRoomReflection } from '../surfaces/roomSurfaceContext';

export function WaterMaterial({
  surface = false,
  puddle = false,
  volume = false,
}: {
  surface?: boolean;
  puddle?: boolean;
  volume?: boolean;
}) {
  const reflection = useRoomReflection();
  const { appearance } = spillSettings;
  const material = {
    color: puddle ? appearance.puddleColor : appearance.waterColor,
    roughness: puddle ? appearance.puddleRoughness : appearance.waterRoughness,
    metalness: 0,
    transparent: true,
    opacity: puddle ? appearance.puddleOpacity : appearance.waterOpacity,
    depthWrite: false,
    alphaTest: surface && !puddle ? 0.02 : 0,
    side: DoubleSide,
    forceSinglePass: true,
    vertexColors: surface,
    envMap: reflection,
    envMapIntensity: 0.45,
  };
  // Thin sheets share the room's baked reflection; only the cup liquid refracts.
  return volume ? (
    <meshPhysicalMaterial
      {...material}
      transmission={appearance.waterTransmission}
      thickness={0.012}
      ior={1.333}
    />
  ) : (
    <meshStandardMaterial {...material} />
  );
}
