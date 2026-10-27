import { paintFloral } from './floralPrint';
import { RoomGeometryPool } from './roomGeometryPool';
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  DoubleSide,
  FrontSide,
  EquirectangularReflectionMapping,
  type BufferGeometry,
} from 'three';
import { RoomSurfaceContext as SurfaceContext } from './roomSurfaceContext';

export type Surface =
  | 'wood'
  | 'cane'
  | 'floral'
  | 'fabric'
  | 'plaster'
  | 'rug'
  | 'plastic'
  | 'paper'
  | 'plain';
type Maps = Partial<Record<Surface, CanvasTexture>>;

// A tiny local reflection field: warm lamps, cool window and dark room.
// This is baked once, not a live cube camera or a downloaded HDR panorama.
function reflectionField() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  const base = ctx.createLinearGradient(0, 0, 0, 128);
  base.addColorStop(0, '#637079');
  base.addColorStop(0.5, '#403c35');
  base.addColorStop(1, '#1c1510');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 128);
  for (const [x, y, w, h, color] of [
    [45, 40, 22, 36, '#b7d5dc'],
    [161, 48, 14, 20, '#ffdc9c'],
    [230, 43, 9, 18, '#f5c17b'],
  ] as const) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  const texture = new CanvasTexture(canvas);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function fabricRelief() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4)
    for (let x = 0; x < 128; x += 4) {
      ctx.fillStyle = (x + y) % 8 ? '#aaaaaa' : '#666666';
      ctx.fillRect(x, y, 3, 1);
      ctx.fillRect(x, y + 1, 1, 3);
    }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Small deterministic, seamless painted tiles; no network assets or per-frame work.
function paintTile(kind: Surface) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  let seed = 31;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle = kind === 'floral' ? '#e8dfc7' : '#e5dfd0';
  ctx.fillRect(0, 0, 512, 512);
  if (kind === 'cane') {
    ctx.clearRect(0, 0, 512, 512);
    for (let i = -512; i <= 1024; i += 32) {
      ctx.strokeStyle = '#a88b59';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
      ctx.strokeStyle = '#c6ab7a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 512, 512);
      ctx.stroke();
    }
  } else if (kind === 'wood') {
    for (let i = 0; i < 170; i++) {
      const y = random() * 512;
      ctx.strokeStyle = `rgba(65,42,26,${0.08 + random() * 0.2})`;
      ctx.lineWidth = 0.5 + random() * 2;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const wave =
          Math.sin((x / 512) * Math.PI * 2 + y * 0.06) * (3 + 4 * Math.sin(y));
        if (!x) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  } else if (kind === 'floral') {
    paintFloral(ctx);
  }
  // Woven and plaster microtexture stays subtle enough not to fight the dither.
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(42,34,30,${random() * (kind === 'plaster' ? 0.12 : 0.07)})`;
    ctx.fillRect(random() * 512, random() * 512, 1, kind === 'plaster' ? 1 : 2);
  }
  if (kind === 'floral' || kind === 'fabric' || kind === 'rug') {
    ctx.strokeStyle = '#382b2514';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }
  if (kind === 'rug') {
    ctx.strokeStyle = '#736852';
    ctx.lineWidth = 10;
    for (let y = 0; y < 512; y += 128)
      for (let x = 0; x < 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x + 64, y + 12);
        ctx.lineTo(x + 116, y + 64);
        ctx.lineTo(x + 64, y + 116);
        ctx.lineTo(x + 12, y + 64);
        ctx.closePath();
        ctx.stroke();
      }
  }
  const map = new CanvasTexture(canvas);
  map.wrapS = map.wrapT = RepeatWrapping;
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function RoomSurfaces({ children }: { children: ReactNode }) {
  const [geometries] = useState(() => new Map<string, BufferGeometry>());
  const [maps] = useState<Maps>(() => {
    const next: Maps = {};
    for (const kind of [
      'wood',
      'floral',
      'fabric',
      'plaster',
      'rug',
      'cane',
    ] as const)
      next[kind] = paintTile(kind);
    return next;
  });
  const [weave] = useState(fabricRelief);
  const [reflection] = useState(reflectionField);
  // Playback controls must not invalidate every material through a fresh
  // context value. These resources are fixed for the mounted room lifetime.
  const surfaces = useMemo(
    () => ({ maps, weave, reflection }),
    [maps, weave, reflection],
  );
  useEffect(() => {
    Object.values(maps).forEach((map) => {
      if (map) map.needsUpdate = true;
    });
    return () => {
      Object.values(maps).forEach((map) => map?.dispose());
      weave?.dispose();
      reflection?.dispose();
      geometries.forEach((geometry) => geometry.dispose());
    };
  }, [maps, weave, reflection, geometries]);
  return (
    <SurfaceContext.Provider value={surfaces}>
      <RoomGeometryPool.Provider value={geometries}>
        {children}
      </RoomGeometryPool.Provider>
    </SurfaceContext.Provider>
  );
}

export function RoomMaterial({
  surface = 'wood',
  color = '#ffffff',
  emissive,
  emissiveIntensity = 0,
  closed = false,
}: {
  surface?: Surface;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  closed?: boolean;
}) {
  const { maps, weave, reflection } = useContext(SurfaceContext);
  const cloth =
    surface === 'floral' || surface === 'fabric' || surface === 'rug';
  return (
    <meshStandardMaterial
      userData={{ roomBatch: true, roomSurface: surface }}
      color={color}
      map={maps[surface]}
      alphaTest={surface === 'cane' ? 0.5 : 0}
      bumpMap={cloth ? weave : surface === 'wood' ? maps.wood : undefined}
      bumpScale={cloth ? 0.0015 : 0.004}
      envMap={reflection}
      envMapIntensity={cloth ? 0.22 : surface === 'wood' ? 0.28 : 0.65}
      roughness={
        cloth
          ? 0.88
          : surface === 'plastic'
            ? 0.26
            : surface === 'wood'
              ? 0.72
              : 0.85
      }
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissiveIntensity}
      side={closed ? FrontSide : DoubleSide}
    />
  );
}
