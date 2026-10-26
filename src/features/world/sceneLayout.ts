import { Vector3 } from 'three';

type BoxLayout = {
  position: [number, number, number];
  size: [number, number, number];
};

export const roomBounds = {
  left: -2.7,
  right: 4,
  back: -3.6,
  front: 5,
  height: 3.2,
};

// Extend over the camera's starting position, including the portrait framing.
export const roomCeiling: BoxLayout = {
  position: [
    (roomBounds.left + roomBounds.right) / 2,
    roomBounds.height + 0.05,
    (roomBounds.back + roomBounds.front + 2) / 2,
  ],
  size: [
    roomBounds.right - roomBounds.left + 0.15,
    0.1,
    roomBounds.front + 2 - roomBounds.back + 0.15,
  ],
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
// Solid wall sections leave real window and entry apertures.
const windowHalfWidth = (1.57 * sideWindowScale[0]) / 2;
const windowHalfHeight = (1.72 * sideWindowScale[1]) / 2;
const windowBottom = sideWindowPosition[1] - windowHalfHeight;
const windowTop = sideWindowPosition[1] + windowHalfHeight;
const windowBack = sideWindowPosition[2] - windowHalfWidth;
const windowFront = sideWindowPosition[2] + windowHalfWidth;
export const doorBack = entryDoorPosition[2] - 0.45 * entryDoorScale[0];
export const doorFront = entryDoorPosition[2] + 0.45 * entryDoorScale[0];
export const doorTop = 2.2 * entryDoorScale[1];
export const windowWallSections: BoxLayout[] = [
  {
    position: [
      roomBounds.left,
      roomBounds.height / 2,
      (roomBounds.back + windowBack) / 2,
    ],
    size: [0.15, roomBounds.height, windowBack - roomBounds.back],
  },
  {
    position: [
      roomBounds.left,
      roomBounds.height / 2,
      (windowFront + doorBack) / 2,
    ],
    size: [0.15, roomBounds.height, doorBack - windowFront],
  },
  {
    position: [
      roomBounds.left,
      roomBounds.height / 2,
      (doorFront + roomBounds.front) / 2,
    ],
    size: [0.15, roomBounds.height, roomBounds.front - doorFront],
  },
  {
    position: [
      roomBounds.left,
      (doorTop + roomBounds.height) / 2,
      entryDoorPosition[2],
    ],
    size: [0.15, roomBounds.height - doorTop, doorFront - doorBack],
  },
  {
    position: [roomBounds.left, windowBottom / 2, sideWindowPosition[2]],
    size: [0.15, windowBottom, windowHalfWidth * 2],
  },
  {
    position: [
      roomBounds.left,
      (windowTop + roomBounds.height) / 2,
      sideWindowPosition[2],
    ],
    size: [0.15, roomBounds.height - windowTop, windowHalfWidth * 2],
  },
];
export const tablePosition: [number, number, number] = [2.95, 0, 2];
export const tableRadius = 0.82;
export const wovenChairPosition: [number, number, number] = [3.1, 0, 2.98];
export const wovenChairYaw = Math.atan2(
  wovenChairPosition[0] - tablePosition[0],
  wovenChairPosition[2] - tablePosition[2],
);
export const glassPosition: [number, number, number] = [-0.32, 0.84, 0.1];
export const glassCenter = new Vector3(...tablePosition)
  .add(new Vector3(...glassPosition))
  .add(new Vector3(0, 0.215, 0));
export const phonePosition: [number, number, number] = [0.22, 0.84, -0.12];
export const televisionPosition: [number, number, number] = [0.65, 0, -2.9];
export const wallUnitUpperPanels: BoxLayout[] = [
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
// Original framing envelope; the animated leftward spill is defined in cup-spill/spillMotion.ts.
export const waterFlowClearance = [
  new Vector3(2.5, 0.85, 2.22),
  new Vector3(2.45, 0.85, 2.55),
  new Vector3(2.35, 0.65, 2.63),
  new Vector3(2.3, 0.45, 2.7),
];
