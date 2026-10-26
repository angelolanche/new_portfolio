import { BoxGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { openingDuration } from './cameraPath';
import { televisionPosition } from './sceneLayout';

export const televisionScreenCenter = new Vector3(...televisionPosition).add(
  new Vector3(-0.1, 1.34, 0.394),
);
export const televisionEntryDuration = 6;
export const televisionWorldScale = 10;

export function sampleTelevisionEntry(seconds: number) {
  const t = Math.max(
    0,
    Math.min(1, (seconds - openingDuration) / televisionEntryDuration),
  );
  return t * t * t * (10 + t * (-15 + 6 * t));
}

/** Equal color phases within the existing 5x-speed cycle (1.14 seconds). */
export function sampleSignalColor(seconds: number) {
  const phase = (((seconds * 5) % 5.7) + 5.7) % 5.7;
  if (phase < 1.9) return 'black';
  if (phase < 3.8) return 'red';
  return 'blue';
}

export function sampleSignalSplit(seconds: number) {
  const phase = (((seconds * 5) % 5.7) + 5.7) % 5.7;
  if (sampleSignalColor(seconds) === 'black') return 0;
  return Math.sin(phase * 95) * 0.085;
}

// Solid bitmap lettering: local geometry, with real depth and no remote font.
const glyphs: Record<string, string[]> = {
  A: ['01110', '11011', '11011', '11111', '11011', '11011', '11011'],
  N: ['11001', '11101', '11101', '11011', '11011', '11001', '11001'],
  G: ['01111', '11000', '11000', '11011', '11001', '11001', '01111'],
  E: ['11111', '11000', '11000', '11110', '11000', '11000', '11111'],
  L: ['11000', '11000', '11000', '11000', '11000', '11000', '11111'],
  O: ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  S: ['01111', '11000', '11000', '01110', '00011', '00011', '11110'],
};

export function createSignalTitle() {
  const cells: BoxGeometry[] = [];
  [...'ANGELOAOSOL'].forEach((letter, index) => {
    glyphs[letter].forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell !== '1') return;
        const box = new BoxGeometry(0.12, 0.12, 0.32);
        box.translate((index * 6 + x - 29) * 0.12, (3 - y) * 0.12, 0);
        cells.push(box);
      });
    });
  });
  const geometry = mergeGeometries(cells);
  cells.forEach((cell) => cell.dispose());
  return geometry;
}
