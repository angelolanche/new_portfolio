import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colorDitherFragmentShader } from './shaders/colorDitherShader';

describe('color dither shader compatibility', () => {
  it('does not redeclare GLSL helpers injected by the installed Three renderer', () => {
    // ShaderMaterial prepends helpers even when the application does not import
    // shader chunks. A duplicate luminance() previously caused a blank canvas.
    const renderer = readFileSync(
      resolve('node_modules/three/src/renderers/webgl/WebGLProgram.js'),
      'utf8',
    );
    const effect = colorDitherFragmentShader;
    const functionNames = (source: string) =>
      [
        ...source.matchAll(
          /\b(?:float|vec[234]|mat[234]|bool|int)\s+(\w+)\s*\(/g,
        ),
      ].map((match) => match[1]);
    const injected = new Set(functionNames(renderer));
    expect(injected.has('luminance')).toBe(true);
    expect(functionNames(effect).filter((name) => injected.has(name))).toEqual(
      [],
    );
  });
});
