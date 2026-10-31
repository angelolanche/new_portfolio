import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import {
  getLoadingProgress,
  subscribeLoading,
  getLoadingStartedAt,
} from './scenePreload';

export function LoadingScreen({ exiting = false }: { exiting?: boolean }) {
  const artRef = useRef<HTMLDivElement>(null);
  const [artReady, setArtReady] = useState(false);
  const progress = Math.round(
    useSyncExternalStore(subscribeLoading, getLoadingProgress),
  );
  useEffect(() => {
    getLoadingStartedAt();
    let active = true;
    const images = Array.from(artRef.current?.querySelectorAll('img') ?? []);
    Promise.allSettled(
      images.map((image) => image.decode?.() ?? Promise.resolve()),
    ).then((results) => {
      if (active && results.every((result) => result.status === 'fulfilled')) {
        setArtReady(true);
      } else if (
        (active && results.some((result) => result.status === 'rejected')) ||
        (!active && !document.querySelector('.scene-loading:not(#boot-loader)'))
      ) {
        document.getElementById('boot-loader')?.remove();
      }
    });
    return () => {
      active = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (artReady) document.getElementById('boot-loader')?.remove();
  }, [artReady]);
  return (
    <div
      className={`scene-loading${artReady ? ' is-art-ready' : ''}${exiting ? ' is-leaving' : ''}`}
      style={{ '--load': `${progress}%` } as CSSProperties}
    >
      <div className="loading-assembly">
        <div className="loading-art" aria-hidden="true" ref={artRef}>
          <img
            className="loading-tether"
            src="/media/loading-tether.svg"
            alt=""
            fetchPriority="high"
          />
          <div className="loading-sun">
            <img src="/favicon.svg" alt="" fetchPriority="high" />
          </div>
          <div className="loading-television">
            <div className="loading-screen">
              <div className="loading-fluid" />
            </div>
            <img
              className="loading-tv"
              src="/media/loading-tv-sketch.jpg"
              alt=""
              fetchPriority="high"
            />
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Preparing the scene"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span className="loading-caption">loading...</span>
        </div>
      </div>
    </div>
  );
}
