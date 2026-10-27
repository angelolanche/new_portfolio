import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { FinishedBox as Box } from '../../surfaces/FinishedBox';

// Small original painted inserts; the portraits depict no identified people.
function paintArtwork(portrait: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, portrait ? '#554b40' : '#7d999f');
  sky.addColorStop(1, portrait ? '#b8a17c' : '#d3bf90');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 384, 512);
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  if (portrait) {
    for (let i = 0; i < 2; i++) {
      const x = 125 + i * 139,
        y = 173 + i * 39;
      ellipse(x, y + 178, 91, 139, i ? '#805d4b' : '#394a50');
      ctx.fillStyle = '#d0b48b';
      ctx.beginPath();
      ctx.moveTo(x - 30, y + 83);
      ctx.lineTo(x, y + 130);
      ctx.lineTo(x + 29, y + 82);
      ctx.fill();
      ellipse(x, y + 51, 24, 43, '#a77e5d');
      ellipse(x, y, 51, 70, '#3a302a');
      ellipse(x + 3, y + 8, 42, 58, '#bf9572');
      ellipse(x + 15, y + 15, 25, 46, '#cba581');
      ellipse(x - 6, y - 44, 42, 23, '#42332a');
      for (const dx of [-15, 19]) {
        ellipse(x + dx, y + 2, 7, 2, '#604b3c');
        ellipse(x + dx + 1, y + 5, 2, 2, '#34332e');
      }
      ctx.strokeStyle = '#91664f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 9);
      ctx.lineTo(x + 9, y + 27);
      ctx.lineTo(x + 2, y + 29);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 41);
      ctx.quadraticCurveTo(x + 4, y + 46, x + 17, y + 40);
      ctx.stroke();
      for (let b = 0; b < 4; b++)
        ellipse(x + 8, y + 144 + b * 28, 2.5, 2.5, '#a89a7c');
    }
  } else {
    ellipse(280, 109, 30, 30, '#e3c999');
    for (let layer = 0; layer < 4; layer++) {
      ctx.fillStyle = ['#86918a', '#647e78', '#526a5e', '#3e5346'][layer];
      ctx.beginPath();
      ctx.moveTo(0, 512);
      for (let x = 0; x <= 384; x += 8)
        ctx.lineTo(
          x,
          245 +
            layer * 51 +
            Math.sin(x * 0.012 + layer * 2) * 32 +
            Math.cos(x * 0.03) * 9,
        );
      ctx.lineTo(384, 512);
      ctx.fill();
    }
    ctx.fillStyle = '#a5b5ad';
    ctx.beginPath();
    ctx.moveTo(204, 299);
    ctx.bezierCurveTo(80, 365, 300, 407, 120, 512);
    ctx.lineTo(268, 512);
    ctx.bezierCurveTo(335, 402, 132, 364, 215, 299);
    ctx.fill();
    for (let i = 0; i < 23; i++) {
      const x = (i * 113) % 384,
        y = 325 + ((i * 37) % 180);
      ctx.strokeStyle = '#4b4936';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y - 35);
      ctx.stroke();
      for (let j = 0; j < 5; j++)
        ellipse(
          x + Math.sin(j * 7 + i) * 12,
          y - 31 - j * 5,
          13,
          8,
          ['#566749', '#66754e', '#788259'][j % 3],
        );
    }
    for (let i = 0; i < 36; i++) {
      ctx.strokeStyle = 'rgba(221,212,170,.35)';
      ctx.beginPath();
      ctx.moveTo(150 + ((i * 29) % 100), 370 + i * 3);
      ctx.lineTo(160 + ((i * 29) % 100), 370 + i * 3);
      ctx.stroke();
    }
  }
  // Deterministic pigment and linen grain, baked once into a small texture.
  for (let i = 0; i < 19000; i++) {
    const x = (i * 127.31) % 384,
      y = (i * 79.73) % 512;
    ctx.fillStyle = i % 2 ? 'rgba(239,221,181,.065)' : 'rgba(45,34,25,.045)';
    ctx.fillRect(x, y, 1 + (i % 3), 1);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function FramedArtwork({ portrait = false }: { portrait?: boolean }) {
  const texture = useMemo(() => paintArtwork(portrait), [portrait]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group>
      <Box
        position={[0, 0, -0.009]}
        size={[0.6, 0.76, 0.035]}
        color="#30251c"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            position={[s * 0.279, 0, 0.025]}
            size={[0.042, 0.76, 0.065]}
            color="#674833"
          />
          <Box
            position={[0, s * 0.359, 0.025]}
            size={[0.52, 0.042, 0.065]}
            color="#674833"
          />
          <Box
            position={[s * 0.253, 0, 0.052]}
            size={[0.009, 0.68, 0.012]}
            color="#b69a61"
            surface="plain"
            radius={0.003}
          />
          <Box
            position={[0, s * 0.333, 0.052]}
            size={[0.51, 0.009, 0.012]}
            color="#b69a61"
            surface="plain"
            radius={0.003}
          />
          <Box
            position={[s * 0.291, 0, 0.06]}
            size={[0.008, 0.75, 0.012]}
            color="#896444"
            radius={0.003}
          />
          <Box
            position={[0, s * 0.371, 0.06]}
            size={[0.59, 0.008, 0.012]}
            color="#896444"
            radius={0.003}
          />
        </group>
      ))}
      <Box
        position={[0, 0, 0.022]}
        size={[0.5, 0.66, 0.012]}
        color="#c9b998"
        surface="paper"
      />
      <Box
        position={[0, 0, 0.031]}
        size={[0.438, 0.578, 0.009]}
        color="#554634"
        surface="plain"
        radius={0}
      />
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[0.426, 0.566]} />
        <meshStandardMaterial map={texture} roughness={0.84} />
      </mesh>
      <mesh position={[0, 0, 0.049]}>
        <planeGeometry args={[0.49, 0.65]} />
        <meshPhysicalMaterial
          color="#d5e3da"
          transparent
          opacity={0.035}
          roughness={0.2}
          metalness={0.12}
          depthWrite={false}
        />
      </mesh>
      {portrait && (
        <group rotation={[-0.26, 0, 0]}>
          <Box
            position={[0, -0.18, -0.09]}
            size={[0.19, 0.36, 0.018]}
            color="#40342a"
          />
        </group>
      )}
    </group>
  );
}
