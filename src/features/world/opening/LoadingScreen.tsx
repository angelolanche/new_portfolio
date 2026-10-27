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
      <div className="loading-tv" aria-hidden="true">
        <div className="loading-screen">
          <div className="loading-fluid" />
        </div>
        <i />
      </div>
      <div
        role="progressbar"
        aria-label="Preparing the scene"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span className="loading-percent">{progress}%</span>
        <span className="loading-caption">
          The percentage reaches 100% sooner than it should, but by the time you
          realize it, it doesn’t matter anymore.
        </span>
      </div>
    </div>
  );
}
