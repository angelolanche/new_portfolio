import { lazy, Suspense, useRef, useState } from 'react';
import type { PointerLook } from './cameraLook';
import { SceneBoundary } from './opening/SceneBoundary';

// Keep the HTML shell and controls available while the 3D bundle loads.
const OpeningCanvas = lazy(() => import('./opening/OpeningCanvas'));

export function Opening({ colorDither = true }: { colorDither?: boolean }) {
  const pointerRef = useRef<PointerLook>({ x: 0, y: 0 });
  const elapsedRef = useRef(0);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const [reset, setReset] = useState(0);
  return (
    <section
      className="opening"
      aria-label="Between Frames opening blockout"
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        if (
          event.target instanceof HTMLElement &&
          event.target.closest('button, [data-camera-controls]')
        ) {
          pointerRef.current = { x: 0, y: 0 };
          return;
        }
        const bounds = event.currentTarget.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        pointerRef.current = {
          x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          y: ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
        };
      }}
      onPointerLeave={() => {
        pointerRef.current = { x: 0, y: 0 };
      }}
    >
      <SceneBoundary>
        <Suspense fallback={<p className="fallback">Loading room…</p>}>
          <OpeningCanvas
            playing={playing}
            reset={reset}
            elapsedRef={elapsedRef}
            pointerRef={pointerRef}
            colorDither={colorDither}
          />
        </Suspense>
      </SceneBoundary>
      <div className="study-caption">
        <span>01 / Before the fall</span>
        <p>
          A room. A television.
          <br />
          An ordinary moment.
        </p>
      </div>
      <div className="controls">
        <button onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            setReset(reset + 1);
            setPlaying(true);
          }}
        >
          Replay
        </button>
      </div>
    </section>
  );
}
