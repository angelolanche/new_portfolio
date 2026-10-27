import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { sampleFloat } from '../signalFloat';

export function FloatingInstructionBlock({
  text,
  width,
  height,
  position,
  tilt = 0,
  seed,
  clockRef,
}: {
  text: string;
  width: number;
  height: number;
  position: readonly [number, number, number];
  tilt?: number;
  seed: number;
  clockRef: RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const offset = useMemo(() => new Vector3(), []);
  const rotation = useMemo(() => new Vector3(), []);
  const geometry = useMemo(() => {
    const box = new BoxGeometry(width, height, 0.07);
    // One physical front surface: lettering cannot fight a second white plane.
    box.clearGroups();
    box.addGroup(0, 24, 0);
    box.addGroup(24, 6, 1);
    box.addGroup(30, 6, 0);
    return box;
  }, [width, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.height = 192;
    canvas.width = Math.ceil((192 * width) / height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('A 2D canvas is required for instructions.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = `${text.length === 1 ? 112 : 88}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, 99, canvas.width - 40);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, width, height]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    if (!group.current) return;
    sampleFloat(clockRef.current, seed, height * 0.16, offset, rotation);
    group.current.position.set(...position).add(offset);
    group.current.rotation.set(rotation.x, rotation.y, tilt + rotation.z);
  });
  return (
    <group ref={group} position={position} rotation={[0, 0, tilt]}>
      <mesh position={[0, 0, -0.035]} geometry={geometry}>
        <meshBasicMaterial
          attach="material-0"
          color="#fff"
          toneMapped={false}
        />
        <meshBasicMaterial
          attach="material-1"
          map={texture}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
