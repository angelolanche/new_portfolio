import {
  CatmullRomCurve3,
  CurvePath,
  LineCurve3,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { projects, signalVideoFor } from '../../../../content/projects';
import {
  signalCenterZ,
  signalSunPosition,
  signalSunClearanceRadius,
  projectBlockDepth,
} from '../signalLayout';

// Bounding spheres include the whole rotated video plus breathing room.
const exclusions = [
  ...projects.map((p, i) => ({
    center: new Vector3(...p.position),
    radius:
      (Math.hypot(
        (5.5 * signalVideoFor(p).width) / signalVideoFor(p).height,
        5.5,
        projectBlockDepth(i) * 2,
      ) *
        p.scale) /
        2 +
      1.5,
  })),
  {
    center: new Vector3(...signalSunPosition),
    radius: signalSunClearanceRadius,
  },
];

/** Split even a segment whose endpoints are outside but which crosses a film. */
export function cutThread(points: Vector3[]) {
  const pieces: Vector3[][] = [];
  let piece: Vector3[] = [];
  const flush = () => {
    if (piece.length > 1) pieces.push(piece);
    piece = [];
  };
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1],
      to = points[i];
    const direction = to.clone().sub(from);
    const lengthSq = direction.lengthSq();
    if (lengthSq < 1e-12) continue;
    const cuts: [number, number][] = [];
    for (const zone of exclusions) {
      const relative = from.clone().sub(zone.center);
      const b = relative.dot(direction);
      const discriminant =
        b * b - lengthSq * (relative.lengthSq() - zone.radius ** 2);
      if (discriminant <= 0) continue;
      const root = Math.sqrt(discriminant);
      const start = Math.max(0, (-b - root) / lengthSq);
      const end = Math.min(1, (-b + root) / lengthSq);
      if (start < end) cuts.push([start, end]);
    }
    cuts.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    const append = (start: number, end: number) => {
      if (end - start < 1e-8) return;
      const a = from.clone().addScaledVector(direction, start);
      const b = from.clone().addScaledVector(direction, end);
      if (piece.length && piece[piece.length - 1].distanceToSquared(a) > 1e-10)
        flush();
      if (!piece.length) piece.push(a);
      piece.push(b);
    };
    for (const [start, end] of cuts) {
      if (start > cursor) append(cursor, start);
      flush();
      cursor = Math.max(cursor, end);
    }
    append(cursor, 1);
  }
  flush();
  return pieces;
}

export function createSignalThreads() {
  const curves = [
    new CatmullRomCurve3([
      new Vector3(0, -1.3, -3),
      new Vector3(4, -2, -16),
      ...projects
        .filter((p) => p.slug !== 'desespero-tropical')
        .map((p) => new Vector3(...p.position)),
      new Vector3(...signalSunPosition),
    ]),
  ];
  for (let i = 0; i < 26; i++)
    curves.push(
      new CatmullRomCurve3(
        Array.from({ length: 8 }, (_, j) => {
          const a = (j / 7) * Math.PI * (1.2 + (i % 4) * 0.35) + i * 1.7;
          const r = (17 + (i % 6) * 6 + Math.sin(j * 2 + i) * 4) * 1.65;
          return new Vector3(
            Math.sin(a) * r,
            Math.sin(a * 1.4 + i) * (9 + (i % 7)) * 1.4,
            signalCenterZ + Math.cos(a) * r,
          );
        }),
      ),
    );
  const tubes = curves.flatMap((curve, i) =>
    cutThread(curve.getPoints(i ? 192 : 600)).map((points) => {
      const path = new CurvePath<Vector3>();
      for (let j = 1; j < points.length; j++)
        path.add(new LineCurve3(points[j - 1], points[j]));
      return new TubeGeometry(
        path,
        Math.max(8, points.length * 2),
        i ? 0.016 + (i % 3) * 0.01 : 0.055,
        4,
        false,
      );
    }),
  );
  const geometry = mergeGeometries(tubes);
  tubes.forEach((t) => t.dispose());
  return geometry;
}
