import { memo, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { Room } from '../room/Room';
import { RoomSurfaces } from '../RoomSurfaces';
import { CameraMove } from './CameraMove';
import type { PointerLook } from '../cameraLook';
import { ColorDither } from '../ColorDither';
import { defaultDitherSettings } from '../ditherSettings';
import { TelevisionStatic } from '../TelevisionStatic';

const OpeningCanvas = memo(function OpeningCanvas({
  playing,
  reset,
  elapsedRef,
  pointerRef,
  colorDither,
}: {
  playing: boolean;
  reset: number;
  elapsedRef: RefObject<number>;
  pointerRef: RefObject<PointerLook>;
  colorDither: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 42, near: 0.03, far: 400 }}
      fallback={
        <p className="fallback">
          WebGL is unavailable. This portfolio is in development.
        </p>
      }
    >
      <color attach="background" args={['#171c1c']} />
      <RoomSurfaces>
        <Room elapsedRef={elapsedRef} />
      </RoomSurfaces>
      <CameraMove
        playing={playing}
        reset={reset}
        elapsedRef={elapsedRef}
        pointerRef={pointerRef}
      />
      {colorDither && (
        <ColorDither settings={defaultDitherSettings} elapsedRef={elapsedRef} />
      )}
      <TelevisionStatic
        playing={playing}
        reset={reset}
        colorDither={colorDither}
        elapsedRef={elapsedRef}
      />
    </Canvas>
  );
});
export default OpeningCanvas;
