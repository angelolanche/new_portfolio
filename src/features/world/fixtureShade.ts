import { useEffect, useMemo } from 'react';
import { LatheGeometry, Vector2 } from 'three';
export function useFixtureShade() {
  const geometry = useMemo(
    () =>
      new LatheGeometry(
        [
          new Vector2(0.055, -0.09),
          new Vector2(0.067, -0.084),
          new Vector2(0.073, -0.055),
          new Vector2(0.082, -0.023),
          new Vector2(0.105, 0.025),
          new Vector2(0.133, 0.066),
          new Vector2(0.14, 0.082),
          new Vector2(0.139, 0.09),
          new Vector2(0.133, 0.09),
          new Vector2(0.127, 0.071),
          new Vector2(0.099, 0.029),
          new Vector2(0.076, -0.02),
          new Vector2(0.066, -0.052),
          new Vector2(0.06, -0.078),
          new Vector2(0.055, -0.08),
        ],
        48,
      ),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}
