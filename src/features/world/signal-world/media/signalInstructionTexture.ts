export const signalInstructions = [
  'Scroll to navigate',
  'Press Enter to open a work',
  'Press Esc to return',
] as const;

export const touchSignalInstructions = [
  'Drag to look around',
  'Use < > to navigate',
  'Tap a work to open',
] as const;

export function signalInstructionLayout(touchDevice: boolean) {
  const widths = touchDevice ? [4.1, 4.7, 3.8] : [3.3, 3.95, 3];
  const height = touchDevice ? 0.62 : 0.48;
  const positions = [
    [-1.475, -1.565, touchDevice ? 0.4 : 0.002],
    [-0.075, -2.165, touchDevice ? 0.4 : 0.002],
    [-1.375, -3.24, touchDevice ? 0.4 : 0.002],
  ] as const;
  return widths.map((width, index) => ({
    width,
    height,
    position: positions[index],
    tilt: [4, -3, 3][index] * (Math.PI / 180),
  }));
}

export const instructionWidth = 6.6;
export const instructionHeight = 2.6;
export const instructionY = -2.3;
