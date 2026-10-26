import { useEffect, useMemo } from 'react';
import { CatmullRomCurve3, DoubleSide, TubeGeometry } from 'three';
import { createJacketSurface } from './jacketGeometry';
import { armchairPosition, armchairYaw } from './sceneLayout';

export function DrapedJacket() {
  const model = useMemo(() => {
    const surface = createJacketSurface();
    const torso = ([-1, 1] as const).map((side) =>
      surface.panel((u, t) => {
        const slit = t > 0.55 ? (t - 0.55) * 0.035 : 0;
        return [
          side * (slit + u * (0.47 - slit)),
          0.035 + t * 0.93 + 0.012 * Math.sin(u * 5) * t,
        ];
      }),
    );
    // Flattened sleeves follow the same cushion, with an asymmetric resting pose.
    const sleeves = ([-1, 1] as const).map((side) =>
      surface.panel(
        (u, t) => [
          side * (0.43 + t * 0.13 + (u - 0.5) * (0.22 - t * 0.07)),
          0.31 + t * (side < 0 ? 0.56 : 0.65),
          0.003 + Math.sin(u * Math.PI) * 0.008,
        ],
        16,
        32,
      ),
    );
    const collar = ([-1, 1] as const).map((side) =>
      surface.panel(
        (u, t) => [
          side * (0.015 + u * 0.15 * (1 - t * 0.55)),
          0.3 + t * 0.11,
          0.003 + Math.sin(t * Math.PI) * 0.012,
        ],
        12,
        12,
      ),
    );
    const seams = [];
    for (const side of [-1, 1]) {
      for (const edge of [0, 0.465]) {
        const points = Array.from({ length: 50 }, (_, i) =>
          surface.point(
            side *
              (edge + (edge === 0 ? Math.max(0, i / 49 - 0.55) * 0.035 : 0)),
            0.04 + (i / 49) * 0.92,
            0.001,
          ),
        );
        seams.push(
          new TubeGeometry(new CatmullRomCurve3(points), 64, 0.0012, 4, false),
        );
      }
      const hem = Array.from({ length: 30 }, (_, i) =>
        surface.point(
          side * (0.02 + (i / 29) * 0.44),
          0.96 + 0.012 * Math.sin((i / 29) * 5),
          0.001,
        ),
      );
      seams.push(
        new TubeGeometry(new CatmullRomCurve3(hem), 32, 0.0014, 4, false),
      );
    }
    const pocket = surface.panel(
      (u, t) => [
        0.18 + u * 0.2,
        0.68 + t * 0.16,
        0.003 + Math.sin(u * Math.PI) * 0.002,
      ],
      12,
      12,
    );
    const zipper = Array.from({ length: 24 }, (_, i) =>
      surface.point(
        0.012 + Math.max(0, i / 23 - 0.55) * 0.035,
        0.54 + i * 0.017,
        0.003,
      ),
    );
    surface.dispose();
    return { torso, sleeves, collar, seams, pocket, zipper };
  }, []);
  useEffect(
    () => () => {
      [
        ...model.torso,
        ...model.sleeves,
        ...model.collar,
        ...model.seams,
        model.pocket,
      ].forEach((g) => g.dispose());
    },
    [model],
  );
  return (
    <group position={armchairPosition} rotation={[0, armchairYaw, 0]}>
      {[...model.torso, ...model.sleeves, ...model.collar, model.pocket].map(
        (g, i) => (
          <mesh key={i} geometry={g} castShadow receiveShadow>
            <meshStandardMaterial
              color={i >= 4 ? '#566574' : '#45566a'}
              roughness={0.94}
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
      {model.seams.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#7d8790" roughness={1} />
        </mesh>
      ))}
      {model.zipper.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.0019, 6, 4]} />
          <meshStandardMaterial
            color="#9b9d94"
            metalness={0.5}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}
