import { useEffect, useMemo } from 'react';
import {
  CatmullRomCurve3,
  DoubleSide,
  ExtrudeGeometry,
  Shape,
  TubeGeometry,
  Vector3,
} from 'three';
import { FinishedBox as Box } from '../../surfaces/FinishedBox';
import { RoomMaterial } from '../../surfaces/RoomSurfaces';

function Lace({ points }: { points: [number, number, number][] }) {
  const key = JSON.stringify(points);
  const geometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3(
          (JSON.parse(key) as [number, number, number][]).map(
            (p) => new Vector3(...p),
          ),
        ),
        24,
        0.0023,
        5,
        false,
      ),
    [key],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <RoomMaterial surface="fabric" color="#e4ddca" />
    </mesh>
  );
}

function CanvasShoe({ color, mirror }: { color: string; mirror: number }) {
  const sole = useMemo(() => {
    const outline = new Shape();
    outline.moveTo(-0.045, 0.145);
    outline.bezierCurveTo(-0.081, 0.1, -0.074, -0.08, -0.061, -0.135);
    outline.bezierCurveTo(-0.048, -0.182, 0.054, -0.182, 0.066, -0.135);
    outline.bezierCurveTo(0.082, -0.07, 0.061, 0.1, 0.045, 0.145);
    outline.quadraticCurveTo(0, 0.164, -0.045, 0.145);
    const g = new ExtrudeGeometry(outline, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.004,
      curveSegments: 20,
    });
    g.rotateX(Math.PI / 2);
    g.translate(0, 0.034, 0);
    return g;
  }, []);
  useEffect(() => () => sole.dispose(), [sole]);
  return (
    <group scale={[mirror, 1, 1]}>
      <mesh geometry={sole} castShadow receiveShadow>
        <meshStandardMaterial color="#d9d3bc" roughness={0.8} />
      </mesh>
      <mesh
        geometry={sole}
        position={[0, 0.009, 0]}
        scale={[1.015, 0.2, 1.015]}
      >
        <meshStandardMaterial color="#383c39" roughness={0.9} />
      </mesh>
      <mesh
        position={[0, 0.072, -0.047]}
        scale={[0.068, 0.044, 0.119]}
        castShadow
      >
        <sphereGeometry args={[1, 28, 18]} />
        <RoomMaterial surface="fabric" color={color} closed />
      </mesh>
      {/* Open canvas ankle, with a gap at the front and an independent tongue. */}
      <mesh
        position={[0, 0.126, 0.073]}
        rotation={[0, Math.PI, 0]}
        scale={[1, 1, 1.08]}
        castShadow
      >
        <cylinderGeometry
          args={[0.049, 0.061, 0.172, 32, 6, true, 0.65, Math.PI * 2 - 1.3]}
        />
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, 0.128, 0.073]}
        rotation={[0, Math.PI, 0]}
        scale={[0.91, 1, 0.98]}
      >
        <cylinderGeometry
          args={[0.049, 0.061, 0.166, 32, 4, true, 0.65, Math.PI * 2 - 1.3]}
        />
        <meshStandardMaterial color="#9b9683" roughness={1} side={DoubleSide} />
      </mesh>
      <group position={[0, 0.131, 0.011]} rotation={[-0.34, 0, 0]}>
        <Box
          position={[0, 0, 0]}
          size={[0.063, 0.17, 0.01]}
          color={color}
          surface="fabric"
          radius={0.006}
        />
        <Box
          position={[0, 0.06, -0.007]}
          size={[0.036, 0.023, 0.003]}
          color="#d7d1bb"
          surface="fabric"
          radius={0.002}
        />
      </group>
      <mesh
        position={[0, 0.062, -0.115]}
        scale={[0.066, 0.035, 0.055]}
        castShadow
      >
        <sphereGeometry args={[1, 32, 18]} />
        <meshStandardMaterial color="#e2ddc9" roughness={0.67} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Lace
            points={[
              [side * 0.047, 0.205, 0.092],
              [side * 0.052, 0.15, 0.115],
              [side * 0.052, 0.068, 0.104],
              [side * 0.064, 0.055, -0.06],
              [side * 0.047, 0.055, -0.115],
            ]}
          />
          <Lace
            points={[
              [side * 0.047, 0.199, 0.092],
              [side * 0.048, 0.15, 0.109],
              [side * 0.047, 0.07, 0.1],
            ]}
          />
          <mesh
            position={[side * 0.052, 0.139, 0.077]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <circleGeometry args={[0.023, 24]} />
            <meshStandardMaterial
              color="#c8c2aa"
              side={DoubleSide}
              roughness={0.9}
            />
          </mesh>
          <mesh
            position={[side * 0.053, 0.139, 0.077]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <ringGeometry args={[0.016, 0.018, 24]} />
            <meshStandardMaterial color="#646d6b" side={DoubleSide} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[side * 0.028, 0.095 + i * 0.018, -0.055 + i * 0.015]}
              rotation={[-Math.PI / 3, 0, 0]}
            >
              <torusGeometry args={[0.0046, 0.0012, 5, 12]} />
              <meshStandardMaterial
                color="#b4b5aa"
                metalness={0.7}
                roughness={0.35}
              />
            </mesh>
          ))}
          <Lace
            points={[
              [side * 0.058, 0.039, 0.125],
              [side * 0.071, 0.039, 0],
              [side * 0.062, 0.039, -0.135],
              [side * 0.025, 0.039, -0.162],
            ]}
          />
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i}>
          <Lace
            points={[
              [-0.028, 0.096 + i * 0.018, -0.055 + i * 0.015],
              [0, 0.11 + i * 0.018, -0.048 + i * 0.015],
              [0.028, 0.114 + i * 0.018, -0.04 + i * 0.015],
            ]}
          />
          <Lace
            points={[
              [0.028, 0.096 + i * 0.018, -0.055 + i * 0.015],
              [0, 0.113 + i * 0.018, -0.048 + i * 0.015],
              [-0.028, 0.114 + i * 0.018, -0.04 + i * 0.015],
            ]}
          />
        </group>
      ))}
      <Lace
        points={[
          [0, 0.193, 0.025],
          [-0.05, 0.2, 0.01],
          [-0.055, 0.177, 0.04],
          [0, 0.193, 0.025],
          [0.046, 0.203, 0.014],
          [0.048, 0.181, 0.05],
          [0, 0.193, 0.025],
          [0.082, 0.08, -0.01],
          [0.095, 0.007, -0.1],
          [0.12, 0.006, -0.135],
        ]}
      />
      <Box
        position={[0, 0.2, 0.125]}
        size={[0.021, 0.041, 0.009]}
        color={color}
        surface="fabric"
        radius={0.003}
      />
      <Box
        position={[0, 0.037, 0.154]}
        size={[0.047, 0.019, 0.006]}
        color="#a19b87"
        surface="plain"
        radius={0.003}
      />
    </group>
  );
}

// Four distinct pairs, on the bare floor behind the sofa, away from the spill.
const shoePairs = [
  {
    position: [-1.08, 0, 2.12] as [number, number, number],
    scale: 1,
    color: '#454d48',
    yaw: -0.48,
  },
  {
    position: [-0.4, 0, 2.42] as [number, number, number],
    scale: 0.95,
    color: '#a34c40',
    yaw: 0.7,
  },
  {
    position: [0.23, 0, 2.04] as [number, number, number],
    scale: 0.62,
    color: '#d5cfb9',
    yaw: -0.35,
  },
  {
    position: [0.67, 0, 2.43] as [number, number, number],
    scale: 0.55,
    color: '#af5746',
    yaw: 1.1,
  },
];
export function CanvasShoes() {
  return (
    <group>
      {shoePairs.map((pair, pairIndex) => (
        <group
          key={pair.color + pair.scale}
          position={pair.position}
          scale={pair.scale}
          rotation={[0, pair.yaw, 0]}
        >
          {[-1, 1].map((side) => (
            <group
              key={side}
              position={[
                side * 0.13,
                (pairIndex === 0 && side === -1) ||
                (pairIndex === 3 && side === 1)
                  ? 0.123
                  : 0,
                side * 0.065,
              ]}
              rotation={[
                0,
                side === -1 ? -0.32 : 0.22,
                (pairIndex === 0 && side === -1) ||
                (pairIndex === 3 && side === 1)
                  ? (-side * Math.PI) / 2
                  : 0,
              ]}
            >
              <CanvasShoe color={pair.color} mirror={side} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
