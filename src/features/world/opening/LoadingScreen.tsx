import { useEffect, useSyncExternalStore, type CSSProperties } from 'react';
import {
  getLoadingProgress,
  subscribeLoading,
  getLoadingStartedAt,
} from './scenePreload';

export function LoadingScreen({ exiting = false }: { exiting?: boolean }) {
  const progress = Math.round(
    useSyncExternalStore(subscribeLoading, getLoadingProgress),
  );
  useEffect(() => {
    getLoadingStartedAt();
    document.getElementById('boot-loader')?.remove();
  }, []);
  return (
    <div
      className={`scene-loading${exiting ? ' is-leaving' : ''}`}
      style={{ '--load': `${progress}%` } as CSSProperties}
    >
      <div className="loading-art" aria-hidden="true">
        <img
          className="loading-tether"
          src="/media/loading-tether.svg"
          alt=""
        />
        <div className="loading-sun">
          <img src="/favicon.svg" alt="" />
        </div>
        <div className="loading-television">
          <div className="loading-screen">
            <div className="loading-fluid" />
          </div>
          <img
            className="loading-tv"
            src="/media/loading-tv-sketch.jpg"
            alt=""
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
  );
}
