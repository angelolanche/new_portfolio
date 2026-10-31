import { useEffect, useState } from 'react';
import {
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  CylinderGeometry,
  Vector2,
} from 'three';
import { RoomMaterial } from '../../surfaces/RoomSurfaces';

const lampBaseProfile = [
  [0, 0.74],
  [0.19, 0.74],
  [0.22, 0.76],
  [0.22, 0.79],
  [0.18, 0.82],
  [0.1, 0.84],
  [0.075, 0.87],
  [0.09, 0.94],
  [0.105, 1.01],
  [0.08, 1.09],
  [0.045, 1.14],
  [0.04, 1.22],
].map(([radius, height]) => new Vector2(radius, height));

function leafGeometry() {
  const geometry = new BufferGeometry();
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const rows = 32,
    columns = 16;
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const width = Math.pow(Math.sin(Math.PI * t), 0.75) * 0.135;
    for (let j = 0; j <= columns; j++) {
      const u = (j / columns) * 2 - 1;
      positions.push(
        u * width,
        t * 0.64,
        Math.sin(t * Math.PI) * 0.075 -
          t * t * 0.11 +
          Math.abs(u) * width * 0.3,
      );
      const vein =
        Math.abs(u) < 0.07 ||
        Math.abs(Math.sin((t - Math.abs(u) * 0.14) * Math.PI * 9)) < 0.17;
      const shade = 0.75 + 0.25 * Math.sin(t * Math.PI);
      colors.push(
        (vein ? 0.37 : 0.12) * shade,
        (vein ? 0.46 : 0.29) * shade,
        (vein ? 0.16 : 0.09) * shade,
      );
      if (i < rows && j < columns) {
        const a = i * (columns + 1) + j,
          b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function DetailedPlant({
  position,
  scale = 1,
  potColor = '#8b6045',
}: {
  position: [number, number, number];
  scale?: number | [number, number, number];
  potColor?: string;
}) {
  const [leaf] = useState(leafGeometry);
  useEffect(() => () => leaf.dispose(), [leaf]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.17, 0.44, 48, 1, true]} />
        <RoomMaterial surface="plain" color={potColor} />
      </mesh>
      {[0.035, 0.415, 0.44].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[i ? 0.245 : 0.18, i === 2 ? 0.019 : 0.009, 8, 48]}
          />
          <RoomMaterial surface="plain" color={potColor} />
        </mesh>
      ))}
      <mesh position={[0, 0.414, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.015, 32]} />
        <RoomMaterial surface="plain" color="#2b231a" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const height = 0.55 + (i % 4) * 0.13;
        return (
          <group key={i} rotation={[0.1 + (i % 3) * 0.08, i * 2.399, 0]}>
            <mesh position={[0, 0.42 + height / 2, 0]} castShadow>
              <cylinderGeometry args={[0.006, 0.014, height, 8]} />
              <RoomMaterial surface="plain" color="#566742" />
            </mesh>
            {[0, 1].map((tier) => (
              <mesh
                key={tier}
                geometry={leaf}
                position={[0, 0.42 + height - tier * 0.22, 0]}
                rotation={[
                  0.38 + tier * 0.25,
                  tier * Math.PI,
                  -0.35 - tier * 0.25,
                ]}
                scale={tier ? 0.72 : 1}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial
                  vertexColors
                  side={DoubleSide}
                  roughness={0.48}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function pleatedShade() {
  const geometry = new CylinderGeometry(0.23, 0.36, 0.42, 192, 8, true);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i),
      z = vertices.getZ(i);
    const radius = Math.hypot(x, z);
    const fold = Math.cos(Math.atan2(z, x) * 48) * 0.006;
    vertices.setXYZ(
      i,
      x * (1 + fold / radius),
      vertices.getY(i),
      z * (1 + fold / radius),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function TelevisionLamp() {
  const [shade] = useState(pleatedShade);
  useEffect(() => () => shade.dispose(), [shade]);
  return (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[lampBaseProfile, 48]} />
        <meshStandardMaterial
          color="#97703e"
          metalness={0.58}
          roughness={0.32}
        />
      </mesh>
      {[0.79, 0.85, 1.14, 1.2].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[i === 0 ? 0.2 : i === 1 ? 0.075 : 0.045, 0.006, 8, 48]}
          />
          <meshStandardMaterial
            color="#d3aa69"
            metalness={0.7}
            roughness={0.28}
          />
        </mesh>
      ))}
      <mesh geometry={shade} position={[0, 1.39, 0]} castShadow>
        <RoomMaterial
          surface="fabric"
          color="#d2ad76"
          emissive="#c88b40"
          emissiveIntensity={0.45}
        />
      </mesh>
      {[1.18, 1.6].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.23 : 0.36, 0.009, 8, 96]} />
          <RoomMaterial surface="fabric" color="#997444" />
        </mesh>
      ))}
      <mesh position={[0, 1.33, 0]}>
        <sphereGeometry args={[0.052, 20, 12]} />
        <meshStandardMaterial
          color="#ffe4b0"
          emissive="#ffbc64"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, 1.61, 0]}>
        <sphereGeometry args={[0.022, 16, 12]} />
        <meshStandardMaterial
          color="#b99052"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}
