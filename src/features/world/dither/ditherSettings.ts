export const ditherPatterns = {
  ordered: { id: 0, label: 'Bayer 4 × 4' },
  noise: { id: 1, label: 'Static grain' },
  lines: { id: 2, label: 'Horizontal lines' },
  bayer2: { id: 3, label: 'Bayer 2 × 2' },
  bayer8: { id: 4, label: 'Bayer 8 × 8' },
  checker: { id: 5, label: 'Checkerboard' },
  dots: { id: 6, label: 'Halftone dots' },
  diagonal: { id: 7, label: 'Diagonal lines' },
  cross: { id: 8, label: 'Crosshatch' },
} as const;

export const ditherAdjustments = [
  { key: 'strength', label: 'Pattern strength', min: 0, max: 2, step: 0.05 },
  { key: 'bias', label: 'Threshold bias', min: -0.5, max: 0.5, step: 0.025 },
  { key: 'rotation', label: 'Pattern angle', min: -180, max: 180, step: 5 },
  { key: 'brightness', label: 'Brightness', min: -0.5, max: 0.5, step: 0.025 },
  { key: 'contrast', label: 'Contrast', min: 0.25, max: 3, step: 0.05 },
  { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.05 },
  { key: 'gamma', label: 'Gamma', min: 0.4, max: 2.5, step: 0.05 },
  { key: 'paletteMix', label: 'Palette blend', min: 0, max: 1, step: 0.05 },
] as const;

export type DitherSettings = {
  intensity: number;
  cellSize: number;
  levels: number;
  style: keyof typeof ditherPatterns;
  palette:
    'original' | 'mono' | 'amber' | 'cyan' | 'green' | 'violet' | 'custom';
  strength: number;
  bias: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  gamma: number;
  paletteMix: number;
  invert: boolean;
  dark: string;
  light: string;
};

export const defaultDitherSettings: DitherSettings = {
  intensity: 1,
  cellSize: 2.5,
  levels: 4,
  strength: 1.2,
  bias: 0.05,
  rotation: 0,
  brightness: -0.1,
  contrast: 1.05,
  saturation: 1.1,
  gamma: 1,
  paletteMix: 1,
  invert: false,
  style: 'checker',
  palette: 'original',
  dark: '#17242b',
  light: '#edc898',
};

// Slightly reduce high frequency post-processing on touch screens.
export const mobileDitherSettings: DitherSettings = {
  ...defaultDitherSettings,
  intensity: 0.88,
  cellSize: 3,
};

export function ditherColors(settings: DitherSettings): [string, string] {
  switch (settings.palette) {
    case 'mono':
      return ['#101010', '#f5f1e8'];
    case 'amber':
      return ['#21130c', '#ffc578'];
    case 'cyan':
      return ['#071b24', '#a1eee1'];
    case 'green':
      return ['#0b2015', '#b4ec83'];
    case 'violet':
      return ['#21142e', '#f2b8ef'];
    default:
      return [settings.dark, settings.light];
  }
}

// The effect runs after OutputPass, so palette values stay in display sRGB.
export function displayRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255,
  ) as [number, number, number];
}

export function serializeDitherSettings(settings: DitherSettings): string {
  return (
    JSON.stringify(
      {
        application: 'Between Frames',
        version: 1,
        settings,
      },
      null,
      2,
    ) + '\n'
  );
}

export function downloadDitherSettings(settings: DitherSettings): void {
  const blob = new Blob([serializeDitherSettings(settings)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'between-frames-dithering.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Let the browser start reading the Blob before releasing its URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
