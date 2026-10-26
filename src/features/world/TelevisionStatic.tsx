import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import {
  Mesh,
  Matrix4,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import { openingDuration } from './cameraPath';
import { televisionSnowShader } from './televisionSnow';
import {
  createSignalTitle,
  sampleSignalColor,
  sampleSignalSplit,
  sampleTelevisionEntry,
  televisionScreenCenter,
  televisionWorldScale,
} from './televisionWorld';

const vertexShader = `varying vec2 vUv;
  void main() { vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

/** The CRT is a window into the same scene that takes over the viewport. */
export function TelevisionStatic({
  playing,
  reset,
  colorDither,
  elapsedRef,
}: {
  playing: boolean;
  reset: number;
  colorDither: boolean;
  elapsedRef: RefObject<number>;
}) {
  const [world] = useState(() => new Scene());
  const [worldCamera] = useState(() => new PerspectiveCamera());
  const [target] = useState(() => new WebGLRenderTarget(1, 1));
  const [geometry] = useState(createSignalTitle);
  const [snow] = useState(() => ({
    time: { value: 0 },
    inverseProjection: { value: new Matrix4() },
    viewToWorld: { value: new Matrix4() },
    screenCenter: { value: televisionScreenCenter.clone() },
  }));
  const [screen] = useState(() => ({
    image: { value: target.texture },
    resolution: { value: new Vector2() },
  }));
  const red = useRef<Mesh>(null);
  const snowMaterial = useRef<ShaderMaterial>(null);
  const blue = useRef<Mesh>(null);
  const title = useRef<Mesh>(null);
  const timeline = useRef({ time: 0, reset });
  useEffect(
    () => () => {
      target.dispose();
      geometry.dispose();
    },
    [target, geometry],
  );

  useFrame(({ gl, scene, camera, size }, delta) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    if (timeline.current.reset !== reset) timeline.current = { time: 0, reset };
    if (playing) timeline.current.time += Math.min(delta, 0.1);
    if (snowMaterial.current)
      snowMaterial.current.uniforms.time.value = timeline.current.time;
    // Preserve CRT grain and tracking coordinates through the handoff. The
    // room camera holds at coverage while the world camera advances inside.
    camera.updateMatrixWorld();
    snow.inverseProjection.value.copy(camera.projectionMatrixInverse);
    snow.viewToWorld.value.copy(camera.matrixWorld);
    const split = sampleSignalSplit(timeline.current.time);
    const signalColor = sampleSignalColor(timeline.current.time);
    if (red.current && blue.current) {
      red.current.visible = signalColor === 'red';
      blue.current.visible = signalColor === 'blue';
      red.current.position.x = split;
      blue.current.position.x = -split;
    }
    if (title.current) {
      title.current.rotation.y = -0.12 + split * 0.2;
      title.current.scale.setScalar(Math.min(1, size.width / size.height));
    }

    worldCamera.copy(camera);
    worldCamera.layers.set(0);
    worldCamera.position
      .copy(camera.position)
      .sub(televisionScreenCenter)
      .multiplyScalar(televisionWorldScale);
    // Preserve the exact room projection at the handoff; then glide inside.
    worldCamera.position.setZ(
      worldCamera.position.z -
        sampleTelevisionEntry(elapsedRef.current) *
          (worldCamera.position.z + 1.5),
    );
    worldCamera.updateMatrixWorld();
    gl.getDrawingBufferSize(screen.resolution.value);
    const { x: width, y: height } = screen.resolution.value;
    if (target.width !== width || target.height !== height)
      target.setSize(width, height);
    const entered = elapsedRef.current >= openingDuration;
    const previousTarget = gl.getRenderTarget();
    const autoClear = gl.autoClear;
    try {
      gl.autoClear = true;
      gl.setRenderTarget(entered ? previousTarget : target);
      gl.render(world, worldCamera);
      gl.setRenderTarget(previousTarget);
      if (entered) return;
      if (!colorDither) gl.render(scene, camera);
      const background = scene.background;
      const layers = camera.layers.mask;
      try {
        scene.background = null;
        gl.autoClear = false;
        camera.layers.set(1);
        gl.render(scene, camera);
      } finally {
        camera.layers.mask = layers;
        scene.background = background;
      }
    } finally {
      gl.setRenderTarget(previousTarget);
      gl.autoClear = autoClear;
    }
  }, 2);

  return (
    <>
      {createPortal(
        <>
          <color attach="background" args={['#090909']} />
          {/* Infinite signal in every direction, without walls or UV poles. */}
          <mesh frustumCulled={false} renderOrder={-1000}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
              ref={snowMaterial}
              uniforms={snow}
              vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }"
              fragmentShader={televisionSnowShader}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={title} geometry={geometry} position={[0, 0, -8]}>
            <meshBasicMaterial color="#000000" toneMapped={false} />
            <mesh ref={red} geometry={geometry} position={[0, 0, 0.025]}>
              <meshBasicMaterial color="#ff254c" toneMapped={false} />
            </mesh>
            <mesh ref={blue} geometry={geometry} position={[0, 0, 0.05]}>
              <meshBasicMaterial color="#18dfff" toneMapped={false} />
            </mesh>
          </mesh>
        </>,
        world,
      )}
      <mesh layers-mask={2} position={televisionScreenCenter}>
        <planeGeometry args={[0.94, 0.67]} />
        <shaderMaterial
          uniforms={screen}
          vertexShader={vertexShader}
          fragmentShader={`uniform sampler2D image; uniform vec2 resolution; varying vec2 vUv;
          void main() {
            vec2 q = abs(vUv - 0.5) - vec2(0.466, 0.452);
            if (length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) > 0.034) discard;
            gl_FragColor = texture2D(image, gl_FragCoord.xy / resolution);
          }`}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
