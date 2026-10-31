import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  Group,
  Matrix4,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  Vector3,
  Raycaster,
  Quaternion,
} from 'three';
import { projects, type Project } from '../../../../content/projects';
import { SignalPlaques } from '../plaques/SignalPlaques';
import { createPlaqueLayout } from '../plaques/plaqueLayout';
import { SignalTitle } from '../media/SignalTitle';
import { SignalComposition } from '../composition/SignalComposition';
import { createTelevisionRenderBounds } from './televisionRenderBounds';
import { advanceFlight } from '../navigation/signalFlight';
import { sampleFloat, videoFloatAmplitude } from '../signalFloat';
import {
  advanceSignal,
  isSignalTravelling,
  signalMobileCameraPushIn,
  signalCameraOffset,
  signalCameraAngles,
  type SignalNavigation,
} from '../navigation/signalNavigation';
import { openingDuration } from '../../opening/cameraPath';
import { sampleLookRange } from '../../opening/cameraLook';
import { televisionSnowShader } from './televisionSnow';
import {
  sampleTelevisionEntry,
  televisionScreenCenter,
  televisionWorldScale,
} from './televisionWorld';

/** The CRT is a window into the same scene that takes over the viewport. */
export function TelevisionStatic({
  playing,
  colorDither,
  elapsedRef,
  navigationRef,
  onEntered,
  onProject,
  openingReadyRef,
}: {
  playing: boolean;
  colorDither: boolean;
  elapsedRef: RefObject<number>;
  navigationRef: RefObject<SignalNavigation>;
  onEntered: () => void;
  onProject: (project: Project) => void;
  openingReadyRef?: RefObject<boolean>;
}) {
  const [sampleRenderBounds] = useState(createTelevisionRenderBounds);
  const [touchDevice] = useState(() =>
    Boolean(
      window.matchMedia?.('(pointer: coarse) and (max-width: 900px)').matches,
    ),
  );
  const [layoutPlaques] = useState(createPlaqueLayout);
  const plaquesRef = useRef<(Group | null)[]>([]);
  const canvas = useThree(({ gl }) => gl.domElement);
  const [world] = useState(() => new Scene());
  const [overlay] = useState(() => new Scene());
  const warmupFrames = useRef(0);
  const worldCameraRef = useRef<PerspectiveCamera | null>(null);
  if (worldCameraRef.current === null) {
    worldCameraRef.current = new PerspectiveCamera();
  }
  const [target] = useState(() => new WebGLRenderTarget(1, 1));
  const [snow] = useState(() => ({
    time: { value: 0 },
    immersion: { value: 0 },
    inverseProjection: { value: new Matrix4() },
    viewToWorld: { value: new Matrix4() },
    screenCenter: { value: televisionScreenCenter.clone() },
  }));
  const [screen] = useState(() => ({
    image: { value: target.texture },
    resolution: { value: new Vector2() },
    entered: { value: false },
  }));
  const snowMaterial = useRef<ShaderMaterial>(null);
  const screenMaterial = useRef<ShaderMaterial>(null);
  const timeline = useRef({ time: 0 });
  const ready = useRef(false);
  const initialized = useRef(false);
  const offset = useRef(new Vector3());
  const orbitRotation = useRef(new Quaternion());
  const previousOrientation = useRef(new Quaternion());
  const turnOrigin = useRef(new Quaternion());
  const desiredOrientation = useRef(new Quaternion());
  const turnTravel = useRef<SignalNavigation['travel']>(undefined);
  const destinationCenter = useRef(new Vector3());
  const upAxis = useRef(new Vector3(0, 1, 0));
  const worldClock = useRef(0);
  const floatPosition = useRef(new Vector3());
  const floatRotation = useRef(new Vector3());
  useEffect(() => {
    const worldCamera = worldCameraRef.current!;
    const raycaster = new Raycaster();
    let pointerStart: { x: number; y: number } | null = null;
    const handlePointerDown = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (
        !pointerStart ||
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) > 8 ||
        !ready.current ||
        navigationRef.current.detailOpen
      )
        return;
      const bounds = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new Vector2(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
        ),
        worldCamera,
      );
      for (const hit of raycaster.intersectObjects(world.children, true)) {
        let object = hit.object;
        while (object.parent && !object.userData.project)
          object = object.parent;
        const project = projects.find(
          (project) => project.slug === object.userData.project,
        );
        if (project) {
          onProject(project);
          break;
        }
      }
      pointerStart = null;
    };
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [canvas, world, navigationRef, onProject]);
  useEffect(
    () => () => {
      target.dispose();
    },
    [target],
  );

  useFrame(({ gl, scene, camera, size }, delta) => {
    const worldCamera = worldCameraRef.current!;
    if (!(camera instanceof PerspectiveCamera)) return;
    if (playing) timeline.current.time += Math.min(delta, 0.1);
    if (snowMaterial.current) {
      snowMaterial.current.uniforms.time.value = timeline.current.time;
      snowMaterial.current.uniforms.immersion.value = sampleLookRange(
        elapsedRef.current,
      ).weight;
    }
    // Preserve CRT grain and tracking coordinates through the handoff. The
    // room camera holds at coverage while the world camera advances inside.
    camera.updateMatrixWorld();
    snow.inverseProjection.value.copy(camera.projectionMatrixInverse);
    snow.viewToWorld.value.copy(camera.matrixWorld);
    if (!navigationRef.current.detailOpen || !initialized.current) {
      previousOrientation.current.copy(worldCamera.quaternion);
      worldCamera.copy(camera);
      worldCamera.layers.set(0);
      worldCamera.position
        .copy(camera.position)
        .sub(televisionScreenCenter)
        .multiplyScalar(televisionWorldScale);
      // Preserve the exact room projection at the handoff; then glide inside.
      worldCamera.position.setZ(
        worldCamera.position.z -
          sampleTelevisionEntry(
            elapsedRef.current,
            worldCamera.position.z + 1.5,
          ) *
            (worldCamera.position.z + 1.5),
      );
      const exploring = elapsedRef.current >= openingDuration;
      if (exploring) {
        if (!ready.current) {
          ready.current = true;
          onEntered();
        }
        advanceSignal(navigationRef.current, delta);
        const travelling = isSignalTravelling(navigationRef.current);
        worldCamera.position.add(
          signalCameraOffset(navigationRef.current.progress, offset.current),
        );
        const angles = signalCameraAngles(navigationRef.current.progress);
        worldCamera.quaternion.identity();
        worldCamera.quaternion.premultiply(
          orbitRotation.current.setFromAxisAngle(upAxis.current, angles.yaw),
        );
        worldCamera.rotateX(angles.pitch);
        // Keep the destination's animated center pinned during the whole journey.
        const destination = projects.find(
          (project) =>
            Math.abs(project.progress - navigationRef.current.target) < 0.00001,
        );
        if (destination) {
          sampleFloat(
            worldClock.current,
            projects.indexOf(destination),
            videoFloatAmplitude,
            floatPosition.current,
            floatRotation.current,
          );
          destinationCenter.current
            .set(
              destination.position[0],
              destination.position[1],
              destination.position[2],
            )
            .add(floatPosition.current);
          worldCamera.lookAt(destinationCenter.current);
        }
        // Inspect every stop in its own framing, including the title and elevated sun.
        if (!travelling) worldCamera.quaternion.multiply(camera.quaternion);
        const travel = navigationRef.current.travel;
        if (travel !== turnTravel.current) {
          turnTravel.current = travel;
          turnOrigin.current.copy(previousOrientation.current);
        }
        // Rotate into the new framing rather than cutting to it on the first wheel event.
        if (travel && travelling && !navigationRef.current.reducedMotion) {
          const t = Math.min(1, travel.elapsed / 0.9);
          const weight = t * t * t * (10 + t * (-15 + 6 * t));
          worldCamera.quaternion.slerpQuaternions(
            turnOrigin.current,
            desiredOrientation.current.copy(worldCamera.quaternion),
            weight,
          );
        }
        if (touchDevice)
          worldCamera.translateZ(
            -signalMobileCameraPushIn(navigationRef.current.progress),
          );
        const flight = navigationRef.current.flight;
        if (flight) {
          advanceFlight(
            flight,
            worldCamera.quaternion,
            delta,
            navigationRef.current.reducedMotion,
          );
          worldCamera.position.add(
            offset.current.set(
              flight.position.x,
              flight.position.y,
              flight.position.z,
            ),
          );
          // While travelling, recenter after restoring a previous free-flight offset.
          if (travelling && destination && (!travel || travel.elapsed >= 0.9))
            worldCamera.lookAt(destinationCenter.current);
        }
        const lensWeight = Math.min(1, navigationRef.current.progress / 0.08);
        const portraitWidening =
          Math.max(0, 1 - size.width / size.height) *
          35 *
          lensWeight *
          lensWeight *
          (3 - 2 * lensWeight);
        worldCamera.fov = touchDevice
          ? Math.min(108, worldCamera.fov + portraitWidening)
          : worldCamera.fov + portraitWidening;
        worldCamera.updateProjectionMatrix();
      }
      worldCamera.updateMatrixWorld();
      initialized.current = true;
    }
    layoutPlaques(
      plaquesRef.current,
      worldCamera,
      worldClock.current,
      ready.current && !navigationRef.current.detailOpen,
      navigationRef.current,
    );
    gl.getDrawingBufferSize(screen.resolution.value);
    const { x: width, y: height } = screen.resolution.value;
    if (target.width !== width || target.height !== height)
      target.setSize(width, height);
    const entered = elapsedRef.current >= openingDuration;
    if (screenMaterial.current)
      screenMaterial.current.uniforms.entered.value = entered;
    const previousTarget = gl.getRenderTarget();
    const autoClear = gl.autoClear;
    try {
      gl.autoClear = true;
      if (!entered) {
        // The target retains full resolution; shade only pixels visible through the CRT.
        target.scissor.copy(sampleRenderBounds(camera, width, height));
        target.scissorTest = true;
      }
      target.scissorTest = !entered;
      // Keep the CRT's original color pipeline after entry too. Direct canvas
      // rendering applies a different output transform to lit materials.
      gl.setRenderTarget(target);
      gl.render(world, worldCamera);
      gl.setRenderTarget(previousTarget);
      if (entered) {
        gl.render(overlay, camera);
        if (openingReadyRef) openingReadyRef.current = true;
        return;
      }
      if (!colorDither) gl.render(scene, camera);
      // Compose only the CRT plane: a second room traversal repeats matrix,
      // light and shadow work even when its meshes are excluded by layers.
      gl.autoClear = false;
      gl.render(overlay, camera);
      if (openingReadyRef && !openingReadyRef.current) {
        // Let initial shader compilation, texture uploads and target allocation
        // finish before starting movement. CameraMove discards the warmup delta.
        warmupFrames.current++;
        if (warmupFrames.current >= 2) openingReadyRef.current = true;
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
          <SignalComposition
            navigationRef={navigationRef}
            playing={playing}
            clockRef={worldClock}
          />
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
          <SignalPlaques plaquesRef={plaquesRef} clockRef={worldClock} />
          <SignalTitle
            playing={playing}
            navigationRef={navigationRef}
            clockRef={timeline}
            floatClockRef={worldClock}
          />
        </>,
        world,
      )}
      {createPortal(
        <mesh position={televisionScreenCenter} frustumCulled={false}>
          <planeGeometry args={[0.94, 0.67]} />
          <shaderMaterial
            ref={screenMaterial}
            uniforms={screen}
            vertexShader={`uniform bool entered; varying vec2 vUv;
              void main() { vUv = uv;
                gl_Position = entered ? vec4(position.xy * vec2(2.0 / 0.94, 2.0 / 0.67), 0.0, 1.0)
                  : projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
            fragmentShader={`uniform sampler2D image; uniform vec2 resolution; uniform bool entered; varying vec2 vUv;
          void main() {
            vec2 q = abs(vUv - 0.5) - vec2(0.466, 0.452);
            if (!entered && length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) > 0.034) discard;
            gl_FragColor = texture2D(image, gl_FragCoord.xy / resolution);
          }`}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>,
        overlay,
      )}
    </>
  );
}
