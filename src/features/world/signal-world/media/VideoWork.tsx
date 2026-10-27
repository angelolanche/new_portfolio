import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
  VideoTexture,
  Group,
  Vector3,
} from 'three';
import type { Project } from '../../../../content/projects';
import type { SignalNavigation } from '../navigation/signalNavigation';
import { projects } from '../../../../content/projects';
import { sampleFloat, videoFloatAmplitude } from '../signalFloat';
import { projectBlockDepth } from '../signalLayout';
import { createVideoBlockGeometry } from './videoBlockGeometry';
import { trackSceneAsset } from '../../opening/scenePreload';

export function VideoWork({
  project,
  navigationRef,
  elapsedRef,
  playing,
  clockRef,
}: {
  project: Project;
  navigationRef: RefObject<SignalNavigation>;
  elapsedRef: RefObject<number>;
  playing: boolean;
  clockRef: RefObject<number>;
}) {
  const videoMaterialRef = useRef<MeshBasicMaterial>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoReadyRef = useRef<(() => void) | null>(null);
  const previousElapsedRef = useRef(0);
  const videoGroupRef = useRef<Group>(null);
  const floatPosition = useRef(new Vector3());
  const floatRotation = useRef(new Vector3());
  const primaryVideo = project.videos[0];
  const projectIndex = projects.indexOf(project);
  const height = 5.5;
  const width = (height * primaryVideo.width) / primaryVideo.height;
  const depth = projectBlockDepth(projectIndex);
  const geometry = useMemo(
    () => createVideoBlockGeometry(width, height, depth),
    [width, depth],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const posterDone = trackSceneAsset();
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    const poster = new TextureLoader().load(
      primaryVideo.poster,
      (texture) => {
        posterDone();
        texture.colorSpace = SRGBColorSpace;
        if (videoMaterialRef.current && !video.src) {
          videoMaterialRef.current.map = texture;
          videoMaterialRef.current.needsUpdate = true;
        }
      },
      undefined,
      () => {
        posterDone();
        /* The selectable signal surface remains available on videoElementRef failure. */
      },
    );
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    const showVideo = () => {
      videoReadyRef.current?.();
      if (videoMaterialRef.current) {
        videoMaterialRef.current.map = texture;
        videoMaterialRef.current.needsUpdate = true;
      }
    };
    const fallback = () => {
      videoReadyRef.current?.();
      if (videoMaterialRef.current) {
        videoMaterialRef.current.map = poster;
        videoMaterialRef.current.needsUpdate = true;
      }
    };
    video.addEventListener('loadeddata', showVideo);
    video.addEventListener('error', fallback);
    video.addEventListener('emptied', fallback);
    videoElementRef.current = video;
    return () => {
      posterDone();
      videoReadyRef.current?.();
      video.pause();
      video.removeEventListener('loadeddata', showVideo);
      video.removeEventListener('error', fallback);
      video.removeEventListener('emptied', fallback);
      video.removeAttribute('src');
      video.load();
      videoElementRef.current = null;
      texture.dispose();
      poster.dispose();
    };
  }, [primaryVideo]);
  useFrame(() => {
    if (videoGroupRef.current) {
      sampleFloat(
        clockRef.current,
        projectIndex,
        videoFloatAmplitude,
        floatPosition.current,
        floatRotation.current,
      );
      videoGroupRef.current.position
        .set(project.position[0], project.position[1], project.position[2])
        .add(floatPosition.current);
      videoGroupRef.current.rotation.set(
        project.rotation[0] + floatRotation.current.x,
        project.rotation[1] + floatRotation.current.y,
        project.rotation[2] + floatRotation.current.z,
      );
    }
    const video = videoElementRef.current;
    if (!video) return;
    if (
      elapsedRef.current < previousElapsedRef.current &&
      video.readyState >= 1
    )
      video.currentTime = 0;
    previousElapsedRef.current = elapsedRef.current;
    const nearby =
      Math.abs(navigationRef.current.progress - project.progress) < 0.085;
    if (nearby && !video.src && !navigationRef.current.reducedMotion) {
      videoReadyRef.current = trackSceneAsset();
      video.src = primaryVideo.preview;
    }
    if (
      nearby &&
      playing &&
      !navigationRef.current.detailOpen &&
      !navigationRef.current.reducedMotion
    ) {
      if (video.paused && video.readyState >= 2)
        void video.play().catch(() => {});
    } else if (!video.paused) video.pause();
    // Release distant decoders; only neighboring works stream simultaneously.
    if (
      !nearby &&
      video.src &&
      Math.abs(navigationRef.current.progress - project.progress) > 0.2
    ) {
      video.removeAttribute('src');
      video.load();
    }
  });
  return (
    <group
      ref={videoGroupRef}
      position={project.position}
      rotation={project.rotation}
      scale={project.scale}
      userData={{ project: project.slug }}
    >
      <mesh position={[0, 0, -depth / 2]} geometry={geometry}>
        <meshBasicMaterial
          ref={videoMaterialRef}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>
      <mesh position={[width / 2 + 0.13, 0, 0]}>
        <boxGeometry args={[0.035, height + 0.4, 0.035]} />
        <meshBasicMaterial color="#ed191c" toneMapped={false} />
      </mesh>
    </group>
  );
}
