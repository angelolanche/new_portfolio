import { CanvasTexture, SRGBColorSpace } from 'three';
import type { Project } from '../../../../content/projects';

const pixelsPerUnit = 180;
const maximumLineWidth = 660;
const horizontalPadding = 42;
const verticalPadding = 32;

export function wrapPlaqueText(
  text: string,
  measure: (value: string) => number,
  maxWidth: number,
) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

/** Rasterized once per work; animation runs in the material, not on the canvas. */
export function createPlaqueText(project: Project) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('A 2D canvas is required for project lettering.');
  const measure = (text: string) => context.measureText(text).width;
  context.font = '48px Arial, sans-serif';
  const titleLines = wrapPlaqueText(project.title, measure, maximumLineWidth);
  context.font = '28px "Courier New", monospace';
  const categoryLines = wrapPlaqueText(
    (project.category || 'Selected work').toUpperCase(),
    measure,
    maximumLineWidth,
  );
  context.font = '48px Arial, sans-serif';
  const titleWidth = Math.max(...titleLines.map(measure));
  context.font = '28px "Courier New", monospace';
  const categoryWidth = Math.max(...categoryLines.map(measure));
  canvas.width = Math.ceil(
    Math.max(titleWidth, categoryWidth) + horizontalPadding * 2,
  );
  canvas.height =
    verticalPadding * 2 +
    categoryLines.length * 38 +
    14 +
    titleLines.length * 56;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = 'top';
  context.fillStyle = '#000';
  context.font = '28px "Courier New", monospace';
  categoryLines.forEach((line, lineIndex) =>
    context.fillText(line, horizontalPadding, verticalPadding + lineIndex * 38),
  );
  const titleY = verticalPadding + categoryLines.length * 38 + 14;
  context.fillStyle = '#111';
  context.font = '48px Arial, sans-serif';
  titleLines.forEach((line, lineIndex) =>
    context.fillText(line, horizontalPadding, titleY + lineIndex * 56),
  );
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return {
    texture,
    titleEffectTop: 1 - (titleY - 7) / canvas.height,
    width: canvas.width / pixelsPerUnit,
    height: canvas.height / pixelsPerUnit,
  };
}
