import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import {
  applyPointerLook,
  sampleLookRange,
  type PointerLook,
} from './cameraLook';
import {
  openingDuration,
  sampleLookWeight,
  createOpeningSampler,
} from './cameraPath';
import {
  cameraSensitivityScale,
  isInspectingSignalStop,
} from '../signal-world/navigation/signalLook';
import { spillDuration } from '../cup-spill/spillMotion';
import { televisionEntryDuration } from '../signal-world/rendering/televisionWorld';
import {
  isSignalTravelling,
  type SignalNavigation,
} from '../signal-world/navigation/signalNavigation';

export function CameraMove({
  playing,
  elapsedRef,
  pointerRef,
  suspended = false,
  navigationRef,
  openingReadyRef,
}: {
  playing: boolean;
  elapsedRef: RefObject<number>;
  pointerRef: RefObject<PointerLook>;
  suspended?: boolean;
  navigationRef?: RefObject<SignalNavigation>;
  openingReadyRef?: RefObject<boolean>;
}) {
  const wasReady = useRef(!openingReadyRef);
  const lookRef = useRef<PointerLook>({ x: 0, y: 0 });
  const weightedPointer = useRef<PointerLook>({ x: 0, y: 0 });
  const aspect = useThree(({ size }) => size.width / size.height);
  const touchDevice = useMemo(
    () =>
      Boolean(
        window.matchMedia?.('(pointer: coarse) and (max-width: 900px)').matches,
      ),
    [],
  );
  const samplePose = useMemo(
    () => createOpeningSampler(aspect, touchDevice),
    [aspect, touchDevice],
  );
  const previousInspection = useRef<boolean | null>(null);
  const lastPose = useRef<ReturnType<typeof samplePose> | null>(null);
  const lastSample = useRef({ time: -1, sampler: samplePose });
  useFrame(({ camera }, delta) => {
    if (suspended && lastPose.current) return;
    const ready = openingReadyRef?.current ?? true;
    const clockDelta = ready && wasReady.current ? Math.min(delta, 0.1) : 0;
    wasReady.current = ready;
    if (playing)
      elapsedRef.current = Math.min(
        Math.max(spillDuration, openingDuration + televisionEntryDuration),
        elapsedRef.current + clockDelta,
      );
    // A room pointer position must not become a large accumulated TV turn.
    // Reset only on the actual handoff, preserving direct/restored TV views.
    if (
      elapsedRef.current >= openingDuration &&
      lastSample.current.time >= 0 &&
      lastSample.current.time < openingDuration
    ) {
      pointerRef.current = { x: 0, y: 0 };
      lookRef.current = { x: 0, y: 0 };
    }
    const poseTime = Math.min(openingDuration, elapsedRef.current);
    if (
      lastSample.current.time !== poseTime ||
      lastSample.current.sampler !== samplePose ||
      !lastPose.current
    ) {
      lastPose.current = samplePose(poseTime);
      lastSample.current = { time: poseTime, sampler: samplePose };
    }
    const pose = lastPose.current;
    if (camera instanceof PerspectiveCamera && camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
    if (camera instanceof PerspectiveCamera) {
      const inspecting = navigationRef
        ? isInspectingSignalStop(navigationRef.current)
        : false;
      const baseRange = sampleLookRange(
        elapsedRef.current,
        inspecting,
        touchDevice,
      );
      const recentering =
        touchDevice && pointerRef.current.x === 0 && pointerRef.current.y === 0;
      const range = recentering ? { ...baseRange, response: 3.1 } : baseRange;
      // Preserve the viewing angle when leaving a stop despite the wider free range.
      if (
        previousInspection.current === true &&
        !inspecting &&
        navigationRef &&
        !isSignalTravelling(navigationRef.current)
      ) {
        const inspectionRange = sampleLookRange(elapsedRef.current, true);
        pointerRef.current.x *= inspectionRange.horizontal / range.horizontal;
        lookRef.current.x *= inspectionRange.horizontal / range.horizontal;
        pointerRef.current.y *= inspectionRange.vertical / range.vertical;
        lookRef.current.y *= inspectionRange.vertical / range.vertical;
      }
      previousInspection.current = inspecting;
      // Clamp mouse and touch together to prevent windup at inspection limits.
      if (inspecting) {
        pointerRef.current.x = Math.max(-1, Math.min(1, pointerRef.current.x));
        pointerRef.current.y = Math.max(-1, Math.min(1, pointerRef.current.y));
      }
      if (navigationRef && isSignalTravelling(navigationRef.current)) {
        pointerRef.current = { x: 0, y: 0 };
        lookRef.current = { x: 0, y: 0 };
      } else if (navigationRef && elapsedRef.current >= openingDuration) {
        const keys = inspecting ? {} : (navigationRef.current.lookKeys ?? {});
        const dt = Math.max(0, Math.min(delta, 0.1));
        pointerRef.current.x +=
          (Number(Boolean(keys.ArrowRight)) - Number(Boolean(keys.ArrowLeft))) *
          dt *
          0.45 *
          cameraSensitivityScale;
        pointerRef.current.y = Math.max(
          -1,
          Math.min(
            1,
            pointerRef.current.y +
              (Number(Boolean(keys.ArrowDown)) -
                Number(Boolean(keys.ArrowUp))) *
                dt *
                0.6 *
                cameraSensitivityScale,
          ),
        );
      }
      const weight = sampleLookWeight(elapsedRef.current);
      if (weight === 0) lookRef.current = { x: 0, y: 0 };
      weightedPointer.current.x = pointerRef.current.x * weight;
      weightedPointer.current.y = pointerRef.current.y * weight;
      applyPointerLook(
        camera,
        weightedPointer.current,
        lookRef.current,
        delta,
        range,
      );
    }
  }, -1);
  return null;
}
