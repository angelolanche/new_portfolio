import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, type ShaderMaterial } from 'three';
import { signalSunPosition } from '../signalLayout';
import { createSignalSunGeometry } from './signalSunGeometry';
import {
  sunVertexShader,
  sunFragmentShader,
  sunAtmosphereFragmentShader,
} from './signalSunShader';

export function SignalSun({ clockRef }: { clockRef: RefObject<number> }) {
  const geometry = useMemo(() => createSignalSunGeometry(), []);
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  const material = useRef<ShaderMaterial>(null);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (material.current)
      material.current.uniforms.time.value = clockRef.current;
  });
  return (
    <group position={signalSunPosition}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[6.3, 48, 32]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={sunVertexShader}
          fragmentShader={sunAtmosphereFragmentShader}
          side={BackSide}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
