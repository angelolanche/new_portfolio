import { CatmullRomCurve3, TubeGeometry } from 'three';
import { createJacketSurface } from './jacketGeometry.ts';

/** Authoring generator: evaluated by Vite, never by the browser. */
export function createAuthoredJacketModel() {
  const surface = createJacketSurface();
  const torso = ([-1, 1] as const).map((side) =>
    surface.panel((acrossProgress, downProgress) => {
      const openingOffset =
        downProgress > 0.55 ? (downProgress - 0.55) * 0.035 : 0;
      return [
        side * (openingOffset + acrossProgress * (0.47 - openingOffset)),
        0.035 +
          downProgress * 0.93 +
          0.012 * Math.sin(acrossProgress * 5) * downProgress,
      ];
    }),
  );
  // Flattened sleeves follow the same cushion, with an asymmetric resting pose.
  const sleeves = ([-1, 1] as const).map((side) =>
    surface.panel(
      (acrossProgress, downProgress) => [
        side *
          (0.43 +
            downProgress * 0.13 +
            (acrossProgress - 0.5) * (0.22 - downProgress * 0.07)),
        0.31 + downProgress * (side < 0 ? 0.56 : 0.65),
        0.003 + Math.sin(acrossProgress * Math.PI) * 0.008,
      ],
      16,
      32,
    ),
  );
  const collar = ([-1, 1] as const).map((side) =>
    surface.panel(
      (acrossProgress, downProgress) => [
        side * (0.015 + acrossProgress * 0.15 * (1 - downProgress * 0.55)),
        0.3 + downProgress * 0.11,
        0.003 + Math.sin(downProgress * Math.PI) * 0.012,
      ],
      12,
      12,
    ),
  );
  const seams = [];
  for (const side of [-1, 1]) {
    for (const seamOffset of [0, 0.465]) {
      const seamPoints = Array.from({ length: 50 }, (_, pointIndex) =>
        surface.point(
          side *
            (seamOffset +
              (seamOffset === 0
                ? Math.max(0, pointIndex / 49 - 0.55) * 0.035
                : 0)),
          0.04 + (pointIndex / 49) * 0.92,
          0.001,
        ),
      );
      seams.push(
        new TubeGeometry(
          new CatmullRomCurve3(seamPoints),
          64,
          0.0012,
          4,
          false,
        ),
      );
    }
    const hemPoints = Array.from({ length: 30 }, (_, pointIndex) =>
      surface.point(
        side * (0.02 + (pointIndex / 29) * 0.44),
        0.96 + 0.012 * Math.sin((pointIndex / 29) * 5),
        0.001,
      ),
    );
    seams.push(
      new TubeGeometry(new CatmullRomCurve3(hemPoints), 32, 0.0014, 4, false),
    );
  }
  const pocket = surface.panel(
    (acrossProgress, downProgress) => [
      0.18 + acrossProgress * 0.2,
      0.68 + downProgress * 0.16,
      0.003 + Math.sin(acrossProgress * Math.PI) * 0.002,
    ],
    12,
    12,
  );
  const zipper = Array.from({ length: 24 }, (_, pointIndex) =>
    surface.point(
      0.012 + Math.max(0, pointIndex / 23 - 0.55) * 0.035,
      0.54 + pointIndex * 0.017,
      0.003,
    ),
  );
  surface.dispose();
  return { torso, sleeves, collar, seams, pocket, zipper };
}
