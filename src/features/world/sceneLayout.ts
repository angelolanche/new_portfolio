import { Vector3 } from 'three';

export const roomBounds = {
  left: -2.7,
  right: 4,
  back: -3.6,
  front: 5,
  height: 3.2,
};

// Reference composition: sofa left, television center-back, table entering from the right.
export const entryDoorPosition: [number, number, number] = [
  roomBounds.left + 0.1,
  0,
  2.706,
];
export const entryDoorScale: [number, number, number] = [1.2, 1.15, 1];
export const sideWindowPosition: [number, number, number] = [
  roomBounds.left + 0.1,
  1.7,
  -1,
];
export const sideWindowScale: [number, number, number] = [0.85, 0.9, 1];
export const tablePosition: [number, number, number] = [2.95, 0, 2];
export const tableRadius = 0.82;
export const wovenChairPosition: [number, number, number] = [3.1, 0, 2.98];
export const wovenChairYaw = Math.atan2(
  wovenChairPosition[0] - tablePosition[0],
  wovenChairPosition[2] - tablePosition[2],
);
export const glassPosition: [number, number, number] = [-0.45, 0.84, 0.22];
export const glassCenter = new Vector3(...tablePosition)
  .add(new Vector3(...glassPosition))
  .add(new Vector3(0, 0.215, 0));
export const phonePosition: [number, number, number] = [0.22, 0.84, -0.12];
export const televisionPosition: [number, number, number] = [0.65, 0, -2.9];
export const wallUnitUpperPanels: {
  position: [number, number, number];
  size: [number, number, number];
}[] = [
  { position: [0, 1.94, -0.44], size: [4.6, 2.1, 0.08] },
  ...[-2.25, -0.96, 0.96, 2.25].map((x) => ({
    position: [x, 1.94, 0] as [number, number, number],
    size: [0.12, 2.1, 0.88] as [number, number, number],
  })),
  { position: [0, 2.48, 0], size: [1.8, 0.09, 0.85] },
  { position: [0, 3, 0], size: [4.72, 0.14, 0.96] },
  { position: [0, 3.1, 0.02], size: [4.82, 0.06, 1] },
];
export const armchairPosition: [number, number, number] = [2.85, 0, -0.2];
export const armchairYaw = Math.atan2(
  armchairPosition[0] - televisionPosition[0],
  armchairPosition[2] - televisionPosition[2],
);
export const sofaPosition: [number, number, number] = [-0.2, 0, 1.05];
// Review envelope only: water crosses the tabletop before a small spill leaves it.
// No water motion or falling glass is implemented in this blockout.
export const waterFlowClearance = [
  new Vector3(2.5, 0.85, 2.22),
  new Vector3(2.45, 0.85, 2.55),
  new Vector3(2.35, 0.65, 2.63),
  new Vector3(2.3, 0.45, 2.7),
];
