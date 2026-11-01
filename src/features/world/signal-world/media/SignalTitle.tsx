import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
  VideoTexture,
} from 'three';
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
  const subtitle = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#10120d';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#777a56';
      context.fillRect(0, 5, canvas.width, 7);
      context.fillRect(0, 116, canvas.width, 5);
      context.fillStyle = '#252719';
      for (let y = 20; y < 112; y += 8) context.fillRect(0, y, 1024, 1);
      context.font = 'bold 58px "Courier New", monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineWidth = 8;
      context.strokeStyle = '#11130d';
      context.strokeText('Creative Technologist', 512, 66);
      context.fillStyle = 'gold';
      context.fillText('Creative Technologist', 512, 66);
      // Small, deterministic marks give the caption a worn transfer-film edge.
      context.fillStyle = '#12140f';
      for (let i = 0; i < 34; i++) {
        const x = (i * 173 + 47) % canvas.width;
        const y = (i * 59 + 13) % canvas.height;
        context.fillRect(x, y, 2 + (i % 4), 1 + (i % 2));
      }
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    return texture;
  }, []);
  useEffect(() => () => face.material.dispose(), [face]);
  useEffect(() => () => subtitle.dispose(), [subtitle]);
  const playbackRef = useRef<ReturnType<typeof createTitlePlayback> | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    const reducedMotion = navigationRef.current.reducedMotion;
    const posterDone = trackSceneAsset();
    const videoDone = reducedMotion ? () => {} : trackSceneAsset();
    let posterReady = false;
    let videoFinished = false;
    const video = takePreparedVideo('/media/aosol-title.mp4');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    const poster = new TextureLoader().load(
      '/media/aosol-title-poster.png',
      (texture) => {
        posterReady = true;
        posterDone();
        if (!active) return;
        texture.colorSpace = SRGBColorSpace;
        if (reducedMotion || video.readyState < 2) {
          face.material.map = texture;
          face.material.needsUpdate = true;
        }
      },
      undefined,
      () => {
        posterDone();
        if (!active) return;
        // Keep a failed poster request from turning the title into a black quad.
        face.material.map = null;
        face.material.needsUpdate = true;
      },
    );
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    const showVideo = () => {
      if (!active) return;
      videoFinished = true;
      window.clearTimeout(videoTimeout);
      videoDone();
      texture.needsUpdate = true;
      face.material.map = texture;
      face.material.needsUpdate = true;
    };
    const showPoster = () => {
      videoFinished = true;
      window.clearTimeout(videoTimeout);
      videoDone();
      // Use the poster only after it has loaded; otherwise the untextured
      // basic material is a clean white title face.
      face.material.map = posterReady ? poster : null;
      face.material.needsUpdate = true;
    };
    const videoTimeout = window.setTimeout(() => {
      if (!videoFinished) showPoster();
    }, 10000);
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
      window.clearTimeout(videoTimeout);
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
      <mesh position={[0, titleHeight / 2 + 0.46, 0.002]}>
        <planeGeometry args={[5.4, 0.68]} />
        <meshBasicMaterial map={subtitle} toneMapped={false} />
      </mesh>
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
