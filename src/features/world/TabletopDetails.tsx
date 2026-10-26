import { useEffect, useMemo } from 'react';
import { CanvasTexture, DoubleSide, SRGBColorSpace, Vector2 } from 'three';
import { FinishedBox as Box } from './FinishedBox';
import { RoomMaterial } from './RoomSurfaces';

export function PhoneDetails() {
  const numbers = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#c5b997';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#343b32';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10;
      ctx.fillText(
        String((i + 1) % 10),
        256 + Math.cos(a) * 211,
        256 + Math.sin(a) * 211,
      );
    }
    ctx.strokeStyle = '#7f795f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 110, 0, Math.PI * 2);
    ctx.stroke();
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => () => numbers.dispose(), [numbers]);
  return (
    <group>
      <Box
        position={[0, 0.026, 0]}
        size={[0.468, 0.012, 0.349]}
        color="#222a23"
        surface="plastic"
        radius={0.025}
      />
      <mesh position={[0, 0.136, 0.055]}>
        <cylinderGeometry args={[0.12, 0.126, 0.012, 64]} />
        <meshStandardMaterial
          color="#5e6455"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.143, 0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.118, 64]} />
        <meshStandardMaterial map={numbers} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.146, 0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.098, 0.0027, 8, 64]} />
        <meshStandardMaterial
          color="#c7c4ac"
          metalness={0.7}
          roughness={0.32}
        />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI * 2) / 10;
        return (
          <group
            key={i}
            position={[Math.cos(a) * 0.08, 0.148, 0.055 + Math.sin(a) * 0.08]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.0135, 20]} />
              <meshStandardMaterial color="#252d25" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.0145, 0.002, 6, 24]} />
              <meshStandardMaterial
                color="#b7b29c"
                metalness={0.65}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.149, 0.055]}>
        <cylinderGeometry args={[0.049, 0.05, 0.009, 40]} />
        <meshStandardMaterial color="#d3c8a6" roughness={0.5} />
      </mesh>
      <Box
        position={[0, 0.155, 0.055]}
        size={[0.059, 0.002, 0.025]}
        color="#b3aa8b"
        surface="paper"
        radius={0.002}
      />
      <group position={[0.102, 0.154, 0.095]} rotation={[0, -0.4, 0]}>
        <Box
          position={[0, 0, 0]}
          size={[0.014, 0.018, 0.05]}
          color="#aaa68c"
          surface="plain"
          radius={0.004}
        />
      </group>
      {[-0.23, 0.23].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0.192, -0.055]}
            size={[0.122, 0.009, 0.169]}
            color="#485044"
            surface="plastic"
            radius={0.025}
          />
          <mesh position={[x, 0.215, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.039, 0.042, 0.006, 32]} />
            <meshStandardMaterial color="#1c251f" roughness={0.55} />
          </mesh>
          {Array.from({ length: 13 }, (_, i) => {
            const a = i * 2.39996,
              r = 0.027 * Math.sqrt(i / 13);
            return (
              <mesh
                key={i}
                position={[x + Math.cos(a) * r, 0.215 + Math.sin(a) * r, 0.036]}
              >
                <circleGeometry args={[0.0032, 8]} />
                <meshStandardMaterial color="#080f0c" />
              </mesh>
            );
          })}
          <Box
            position={[x * 0.62, 0.217, -0.08]}
            size={[0.018, 0.027, 0.026]}
            color="#92947b"
            surface="plastic"
            radius={0.005}
          />
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          position={[0.241, 0.067, -0.08 + i * 0.023]}
          size={[0.002, 0.028, 0.006]}
          color="#222a22"
          surface="plain"
          radius={0.001}
        />
      ))}
    </group>
  );
}

export function TableLamp() {
  return (
    <group position={[0.3, 0.84, -0.55]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <latheGeometry
          args={[
            [
              [0.001, -0.028],
              [0.16, -0.028],
              [0.177, -0.022],
              [0.18, -0.01],
              [0.174, 0.007],
              [0.145, 0.024],
              [0.094, 0.032],
              [0.072, 0.04],
            ].map(([r, y]) => new Vector2(r, y)),
            48,
          ]}
        />
        <meshStandardMaterial color="#765132" roughness={0.44} />
      </mesh>
      <mesh castShadow>
        <latheGeometry
          args={[
            [
              [0.069, 0.063],
              [0.066, 0.084],
              [0.041, 0.103],
              [0.034, 0.14],
              [0.044, 0.19],
              [0.05, 0.24],
              [0.045, 0.29],
              [0.027, 0.33],
              [0.021, 0.39],
              [0.029, 0.407],
              [0.028, 0.43],
            ].map(([r, y]) => new Vector2(r, y)),
            40,
          ]}
        />
        <meshStandardMaterial
          color="#ae8b57"
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>
      {[0.082, 0.325, 0.399].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[y < 0.1 ? 0.063 : 0.027, 0.0035, 8, 40]} />
          <meshStandardMaterial
            color="#c1a16b"
            metalness={0.65}
            roughness={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.15, 0.24, 0.29, 64, 1, true]} />
        <RoomMaterial
          surface="fabric"
          color="#d3b583"
          emissive="#d99948"
          emissiveIntensity={0.65}
        />
      </mesh>
      <mesh position={[0, 0.53, 0]}>
        <cylinderGeometry args={[0.146, 0.236, 0.286, 64, 1, true]} />
        <meshStandardMaterial
          color="#c8b58d"
          emissive="#d99948"
          emissiveIntensity={0.65}
          roughness={1}
          side={DoubleSide}
        />
      </mesh>
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i * Math.PI) / 24;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.195, 0.53, 0]} rotation={[0, 0, 0.301]}>
              <cylinderGeometry args={[0.0016, 0.0022, 0.304, 5]} />
              <meshStandardMaterial
                color="#c5a777"
                emissive="#b18a56"
                emissiveIntensity={0.3}
                roughness={1}
              />
            </mesh>
          </group>
        );
      })}
      {[0.385, 0.675].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.15 : 0.24, 0.005, 8, 64]} />
          <meshStandardMaterial color="#8d714c" roughness={0.7} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <Box
            position={[0.074, 0.666, 0]}
            size={[0.15, 0.003, 0.003]}
            color="#8e794e"
            surface="plain"
            radius={0.001}
          />
        </group>
      ))}
      <mesh position={[0, 0.692, 0]}>
        <sphereGeometry args={[0.012, 16, 12]} />
        <meshStandardMaterial
          color="#b79a62"
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0.033, 0.376, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.025, 12]} />
        <meshStandardMaterial color="#53402c" roughness={0.5} />
      </mesh>
      <pointLight
        position={[0, 0.43, 0.04]}
        color="#ffd092"
        intensity={5}
        distance={2.5}
      />
    </group>
  );
}
