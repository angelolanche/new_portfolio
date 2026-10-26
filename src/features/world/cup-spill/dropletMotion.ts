import { spillSettings } from './spillSettings';
export type WaterDrop = {
  x: number;
  y: number;
  z: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  volume: number;
  birthTime: number;
};
export function getDropletPosition(drop: WaterDrop, time: number) {
  const age = Math.max(0, time - drop.birthTime);
  return [
    drop.x + drop.velocityX * age,
    drop.y +
      drop.velocityY * age -
      (spillSettings.water.gravity / 2) * age * age,
    drop.z + drop.velocityZ * age,
  ] as const;
}
