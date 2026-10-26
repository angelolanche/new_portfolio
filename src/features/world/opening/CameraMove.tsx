import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { applyPointerLook, type PointerLook } from '../cameraLook';
import {
  openingDuration,
  sampleLookWeight,
  createOpeningSampler,
} from '../cameraPath';
import { spillDuration } from '../cup-spill/spillMotion';
import { televisionEntryDuration } from '../televisionWorld';

export function CameraMove({
  playing,
  reset,
  elapsedRef,
  pointerRef,
}: {
  playing: boolean;
  reset: number;
  elapsedRef: RefObject<number>;
  pointerRef: RefObject<PointerLook>;
}) {
  const lastReset = useRef(reset);
  const lookRef = useRef<PointerLook>({ x: 0, y: 0 });
  const weightedPointer = useRef<PointerLook>({ x: 0, y: 0 });
  const aspect = useThree(({ size }) => size.width / size.height);
  const samplePose = useMemo(() => createOpeningSampler(aspect), [aspect]);
  const lastPose = useRef<ReturnType<typeof samplePose> | null>(null);
  const lastSample = useRef({ time: -1, sampler: samplePose });
  useFrame(({ camera }, delta) => {
    if (lastReset.current !== reset) {
      elapsedRef.current = 0;
      lastReset.current = reset;
      lookRef.current = { x: 0, y: 0 };
      pointerRef.current = { x: 0, y: 0 };
    }
    if (playing)
      elapsedRef.current = Math.min(
        Math.max(spillDuration, openingDuration + televisionEntryDuration),
        elapsedRef.current + Math.min(delta, 0.1),
      );
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
      const weight = sampleLookWeight(elapsedRef.current);
      if (weight === 0) lookRef.current = { x: 0, y: 0 };
      weightedPointer.current.x = pointerRef.current.x * weight;
      weightedPointer.current.y = pointerRef.current.y * weight;
      applyPointerLook(camera, weightedPointer.current, lookRef.current, delta);
    }
  }, -1);
  return null;
}
