import { spillSettings } from './spillSettings';
import { DoubleSide } from 'three';

export function WaterMaterial({
  surface = false,
  puddle = false,
}: {
  surface?: boolean;
  puddle?: boolean;
}) {
  return (
    <meshPhysicalMaterial
      color={
        puddle
          ? spillSettings.appearance.puddleColor
          : spillSettings.appearance.waterColor
      }
      roughness={
        puddle
          ? spillSettings.appearance.puddleRoughness
          : spillSettings.appearance.waterRoughness
      }
      metalness={0}
      transmission={
        puddle
          ? spillSettings.appearance.puddleTransmission
          : spillSettings.appearance.waterTransmission
      }
      thickness={puddle ? spillSettings.appearance.puddleThickness : 0.018}
      ior={1.333}
      transparent
      opacity={
        puddle
          ? spillSettings.appearance.puddleOpacity
          : spillSettings.appearance.waterOpacity
      }
      depthWrite={false}
      alphaTest={surface && !puddle ? 0.02 : 0}
      clearcoat={puddle ? spillSettings.appearance.puddleClearcoat : 1}
      clearcoatRoughness={
        puddle ? spillSettings.appearance.puddleClearcoatRoughness : 0
      }
      side={DoubleSide}
      vertexColors={surface}
    />
  );
}
