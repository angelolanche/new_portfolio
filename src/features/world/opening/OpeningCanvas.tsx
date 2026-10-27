import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { LoadingScreen } from './LoadingScreen';
import {
  areSceneAssetsReady,
  getLoadingRemaining,
  reportLoading,
} from './scenePreload';
import { openingDuration } from './timing';
import { Room } from '../room/Room';
import { RoomSurfaces } from '../surfaces/RoomSurfaces';
import { CameraMove } from './CameraMove';
import type { PointerLook } from './cameraLook';
import { ColorDither } from '../dither/ColorDither';
import { defaultDitherSettings } from '../dither/ditherSettings';
import { TelevisionStatic } from '../signal-world/rendering/TelevisionStatic';
import type { SignalNavigation } from '../signal-world/navigation/signalNavigation';
import type { Project } from '../../../content/projects';
import { RealisticSpace } from '../exterior/RealisticSpace';

function ReadyFrames({
  onReady,
  exteriorReadyRef,
}: {
  onReady: () => void;
  exteriorReadyRef: RefObject<boolean>;
}) {
  const frames = useRef(0);
  useFrame(() => {
    if (!exteriorReadyRef.current || !areSceneAssetsReady()) {
      frames.current = 0;
      return;
    }
    if (++frames.current === 3) onReady();
  });
  return null;
}

function CanvasFallback({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return (
    <p className="fallback">
      WebGL is unavailable. Use Work index or About to explore the portfolio.
    </p>
  );
}

const OpeningCanvas = memo(function OpeningCanvas({
  playing,
  elapsedRef,
  pointerRef,
  colorDither,
  navigationRef,
  onEntered,
  onProject,
  suspended,
}: {
  playing: boolean;
  elapsedRef: RefObject<number>;
  pointerRef: RefObject<PointerLook>;
  colorDither: boolean;
  navigationRef: RefObject<SignalNavigation>;
  onEntered: () => void;
  onProject: (project: Project) => void;
  suspended: boolean;
}) {
  const openingReadyRef = useRef(false);
  const exteriorReadyRef = useRef(false);
  useEffect(() => {
    if (elapsedRef.current >= openingDuration) exteriorReadyRef.current = true;
  }, [elapsedRef]);
  const [ready, setReady] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [warmed, setWarmed] = useState(false);
  useEffect(() => {
    if (!warmed) return;
    reportLoading(100);
    const remaining = getLoadingRemaining();
    const reveal = window.setTimeout(() => setRevealing(true), remaining + 180);
    const timeout = window.setTimeout(() => setReady(true), remaining + 780);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(timeout);
    };
  }, [warmed]);
  return (
    <>
      {!ready && <LoadingScreen exiting={revealing} />}
      <Canvas
        shadows
        gl={{ transmissionResolutionScale: 0.75 }}
        dpr={[1, 1.5]}
        camera={{ fov: 42, near: 0.03, far: 400 }}
        fallback={<CanvasFallback onReady={() => setWarmed(true)} />}
      >
        <ReadyFrames
          exteriorReadyRef={exteriorReadyRef}
          onReady={() => setWarmed(true)}
        />
        <color attach="background" args={['#171c1c']} />
        <RealisticSpace
          onReady={() => {
            exteriorReadyRef.current = true;
          }}
          elapsedRef={elapsedRef}
          playing={playing && ready}
          navigationRef={navigationRef}
          colorDither={colorDither}
        />
        <RoomSurfaces>
          <Room elapsedRef={elapsedRef} />
        </RoomSurfaces>
        <CameraMove
          openingReadyRef={openingReadyRef}
          navigationRef={navigationRef}
          playing={playing && ready}
          elapsedRef={elapsedRef}
          pointerRef={pointerRef}
          suspended={suspended}
        />
        {colorDither && (
          <ColorDither
            settings={defaultDitherSettings}
            elapsedRef={elapsedRef}
          />
        )}
        <TelevisionStatic
          openingReadyRef={openingReadyRef}
          playing={playing && ready}
          colorDither={colorDither}
          elapsedRef={elapsedRef}
          navigationRef={navigationRef}
          onEntered={onEntered}
          onProject={onProject}
        />
      </Canvas>
    </>
  );
});
export default OpeningCanvas;
