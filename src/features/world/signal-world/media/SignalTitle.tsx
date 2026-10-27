import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, VideoTexture } from 'three';
import { createPlaqueMaterial } from '../plaques/plaqueMaterial';
import { createTitlePlayback } from './signalTitlePlayback';
import { SignalInstructions } from './SignalInstructions';
import { takePreparedVideo, trackSceneAsset } from '../../opening/scenePreload';
import type { SignalNavigation } from '../navigation/signalNavigation';
import {
  titleWidth,
  titleHeight,
  titleDepth,
  titleHorizontalPadding,
  signalTitleScale,
} from './signalTitleLayout';

/** The owner's reference supplies both the exact lettering and chromatic animation. */
export function SignalTitle({
  playing,
  navigationRef,
  clockRef,
  floatClockRef,
}: {
  playing: boolean;
  navigationRef: RefObject<SignalNavigation>;
  clockRef: RefObject<{ time: number }>;
  floatClockRef: RefObject<number>;
}) {
  const aspect = useThree(({ size }) => size.width / size.height);
  const face = useMemo(() => createPlaqueMaterial(null, true), []);
  useEffect(() => () => face.material.dispose(), [face]);
  const playbackRef = useRef<ReturnType<typeof createTitlePlayback> | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    const reducedMotion = navigationRef.current.reducedMotion;
    const posterDone = trackSceneAsset();
    const videoDone = reducedMotion ? () => {} : trackSceneAsset();
    const video = takePreparedVideo('/media/aosol-title.mp4');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    const poster = new TextureLoader().load(
      '/media/aosol-title-poster.png',
      (texture) => {
        posterDone();
        if (!active) return;
        texture.colorSpace = SRGBColorSpace;
        if (reducedMotion || video.readyState < 2) {
          face.material.map = texture;
          face.material.needsUpdate = true;
        }
      },
      undefined,
      posterDone,
    );
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    const showVideo = () => {
      if (!active) return;
      videoDone();
      texture.needsUpdate = true;
      face.material.map = texture;
      face.material.needsUpdate = true;
    };
    const showPoster = () => {
      videoDone();
      face.material.map = poster;
      face.material.needsUpdate = true;
    };
    video.addEventListener('loadeddata', showVideo);
    video.addEventListener('error', showPoster);
    if (!reducedMotion && !video.hasAttribute('src'))
      video.src = '/media/aosol-title.mp4';
    if (!reducedMotion && video.readyState >= 2) queueMicrotask(showVideo);
    const playback = createTitlePlayback(video);
    playbackRef.current = playback;
    return () => {
      posterDone();
      videoDone();
      active = false;
      playbackRef.current = null;
      video.removeEventListener('loadeddata', showVideo);
      video.removeEventListener('error', showPoster);
      playback.dispose();
      texture.dispose();
      poster.dispose();
    };
  }, [navigationRef, face]);
  useFrame(() => {
    if (!navigationRef.current.reducedMotion)
      playbackRef.current?.update(
        clockRef.current.time,
        playing && !navigationRef.current.detailOpen,
      );
  });
  return (
    <group position={[0, 1.05, -8]} scale={signalTitleScale(aspect)}>
      <mesh position={[0, 0, -titleDepth / 2]}>
        <boxGeometry
          args={[
            titleWidth + titleHorizontalPadding * 2,
            titleHeight + 0.1,
            titleDepth,
          ]}
        />
        <meshBasicMaterial color="#fff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.001]} material={face.material}>
        <planeGeometry args={[titleWidth, titleHeight]} />
      </mesh>
      <SignalInstructions clockRef={floatClockRef} />
    </group>
  );
}
