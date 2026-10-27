export const sunInstructionPitch = Math.atan2(90 * 0.65, 58);
export const sunInstructionY = -21;
export const sunInstructionScale = (aspect: number) =>
  Math.min(1.2, aspect * 0.7);

export const sunInstructionBlocks = [
  {
    text: 'Use the keys to move through space',
    x: -37,
    y: 20,
    width: 23,
    height: 2.4,
  },
  { text: 'w', x: -17, y: 21.8, width: 2.8, height: 2.8 },
  { text: 'a', x: -20.3, y: 18.5, width: 2.8, height: 2.8 },
  { text: 's', x: -17, y: 18.5, width: 2.8, height: 2.8 },
  { text: 'd', x: -13.7, y: 18.5, width: 2.8, height: 2.8 },
  {
    text: 'Use the arrow keys to move the camera',
    x: 3,
    y: -5,
    width: 24,
    height: 2.4,
  },
  { text: '↑', x: 24, y: -3.2, width: 2.8, height: 2.8 },
  { text: '←', x: 20.7, y: -6.5, width: 2.8, height: 2.8 },
  { text: '↓', x: 24, y: -6.5, width: 2.8, height: 2.8 },
  { text: '→', x: 27.3, y: -6.5, width: 2.8, height: 2.8 },
  {
    text: 'Scroll up or down to return to the guided tour',
    x: 32,
    y: 22,
    width: 36,
    height: 2.4,
  },
] as const;
