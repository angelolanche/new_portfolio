// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { projects } from '../../../../content/projects';
import { createPlaqueText } from './plaqueText';

it('draws larger metadata and unchanged title text, without adding arrows, with a separate effect region', () => {
  const draws: { text: string; font: string; y: number; color: string }[] = [];
  const context = {
    font: '',
    fillStyle: '',
    textBaseline: '',
    measureText(text: string) {
      return { width: text.length * parseFloat(this.font) * 0.55 };
    },
    fillRect() {},
    fillText(text: string, _x: number, y: number) {
      draws.push({ text, font: this.font, y, color: this.fillStyle });
    },
  };
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  try {
    for (const project of projects) {
      draws.length = 0;
      const lettering = createPlaqueText(project);
      const metadata = draws.filter((draw) => draw.font.includes('Courier'));
      const title = draws.filter((draw) => draw.font.includes('Arial'));
      expect(metadata.every((draw) => parseFloat(draw.font) === 28)).toBe(true);
      expect(metadata.every((draw) => draw.color === '#000')).toBe(true);
      expect(metadata.map((draw) => draw.text).join(' ')).toBe(
        (project.category || 'Selected work').toUpperCase(),
      );
      expect(title.every((draw) => draw.color === '#111')).toBe(true);
      expect(title.every((draw) => parseFloat(draw.font) === 48)).toBe(true);
      expect(title.map((draw) => draw.text).join(' ')).toBe(project.title);
      expect(draws.some((draw) => /[↗→]/.test(draw.text))).toBe(false);
      const canvas = lettering.texture.image as HTMLCanvasElement;
      for (const draw of metadata) {
        // The whole metadata glyph height is above the chromatic region.
        expect(1 - (draw.y + 28) / canvas.height).toBeGreaterThan(
          lettering.titleEffectTop,
        );
      }
      for (const draw of title) {
        expect(1 - draw.y / canvas.height).toBeLessThan(
          lettering.titleEffectTop,
        );
      }
      lettering.texture.dispose();
    }
  } finally {
    getContext.mockRestore();
  }
});
