import { useOpeningControls } from './opening/useOpeningControls';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { PointerLook } from './opening/cameraLook';
import { SceneBoundary } from './opening/SceneBoundary';
import { signalEntryEnd as entryEnd } from './opening/timing';

import {
  createFlight,
  type SignalNavigation,
} from './signal-world/navigation/signalNavigation';
import {
  projects,
  projectFromPath,
  type Project,
} from '../../content/projects';
import { ProjectDetail } from '../projects/ProjectDetail';
import { AboutDetail } from '../about/AboutDetail';
import './signal-world/signal.css';
import { LoadingScreen } from './opening/LoadingScreen';
import { prepareScene, reportLoading } from './opening/scenePreload';

const OpeningCanvas = lazy(async () => {
  const [module] = await Promise.all([
    import('./opening/OpeningCanvas'),
    prepareScene(),
  ]);
  reportLoading(85);
  return module;
});

export function Opening({ colorDither = true }: { colorDither?: boolean }) {
  const [project, setProject] = useState(() =>
    projectFromPath(window.location.pathname),
  );
  const [aboutOpen, setAboutOpen] = useState(
    () => window.location.pathname === '/about',
  );
  const [reducedMotion] = useState(() =>
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  );
  const pointerRef = useRef<PointerLook>({ x: 0, y: 0 });

  const elapsedRef = useRef(
    project || aboutOpen || reducedMotion ? entryEnd : 0,
  );
  const navigationRef = useRef<SignalNavigation>({
    progress: project?.progress ?? 0,
    target: project?.progress ?? 0,
    detailOpen: Boolean(project) || aboutOpen,
    reducedMotion,
    flight: createFlight(),
  });
  const indexDialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const pushedProject = useRef(false);

  const [entered, setEntered] = useState(
    Boolean(project) || aboutOpen || reducedMotion,
  );
  const [indexOpen, setIndexOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { handlers, move, resetPointer } = useOpeningControls({
    pointerRef,
    navigationRef,
    elapsedRef,
    sectionRef,
    indexDialog,
    entered,
    blocked: Boolean(project) || aboutOpen || indexOpen,
    onOpenWork: () => {
      const selected = projects.find(
        (item) =>
          Math.abs(item.progress - navigationRef.current.progress) < 0.00001,
      );
      if (selected) openProject(selected);
    },
  });
  const onEntered = useCallback(() => {
    setEntered(true);
    if (!navigationRef.current.detailOpen && !indexDialog.current?.open)
      sectionRef.current?.focus({ preventScroll: true });
  }, []);
  const enter = () => {
    elapsedRef.current = entryEnd;
    setEntered(true);
  };
  const openProject = useCallback((item: Project) => {
    returnFocus.current = sectionRef.current;
    indexDialog.current?.close();
    setIndexOpen(false);
    navigationRef.current.detailOpen = true;
    window.history.pushState(
      { signalProject: true },
      '',
      `/projects/${item.slug}`,
    );
    pushedProject.current = true;
    setProject(item);
  }, []);
  const closeProject = useCallback(() => {
    if (pushedProject.current) window.history.back();
    else {
      window.history.replaceState(null, '', '/');
      navigationRef.current.detailOpen = false;
      setProject(undefined);
      setAboutOpen(false);
    }
  }, []);
  useEffect(() => {
    const pop = () => {
      const next = projectFromPath(window.location.pathname);
      const about = window.location.pathname === '/about';
      navigationRef.current.detailOpen = Boolean(next) || about;
      pushedProject.current = Boolean(
        (next || about) &&
        (window.history.state?.signalProject ||
          window.history.state?.signalAbout),
      );
      setProject(next);
      setAboutOpen(about);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    if (!project && !aboutOpen) returnFocus.current?.focus();
  }, [project, aboutOpen]);
  useEffect(() => {
    if (indexOpen) indexDialog.current?.showModal();
    else indexDialog.current?.close();
  }, [indexOpen]);

  return (
    <section
      ref={sectionRef}
      className={`opening${entered ? ' signal-entered' : ''}`}
      aria-label="Between Frames interactive portfolio"
      aria-describedby="camera-instructions"
      tabIndex={0}
      {...handlers}
    >
      <p id="camera-instructions" className="sr-only">
        Scroll or swipe to the next or previous work. The camera centers the
        work during travel. Move the mouse to look around a work after arriving.
        In free flight, use arrow keys to look. Page Up and Page Down select
        works. Use two fingers to look up or down on touchscreens. WASD moves
        freely; Q/E descends or ascends. Press Enter to open the selected work.
        Press Esc to return from a work.
      </p>
      <SceneBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <OpeningCanvas
            playing={!reducedMotion && !project && !aboutOpen && !indexOpen}
            elapsedRef={elapsedRef}
            pointerRef={pointerRef}
            colorDither={colorDither}
            navigationRef={navigationRef}
            onEntered={onEntered}
            onProject={openProject}
            suspended={Boolean(project) || aboutOpen || indexOpen}
          />
        </Suspense>
      </SceneBoundary>
      <div className="signal-access" data-camera-controls>
        <button onClick={() => setIndexOpen(true)}>Work index +</button>
        <button
          onClick={() => {
            returnFocus.current = sectionRef.current;
            navigationRef.current.detailOpen = true;
            window.history.pushState({ signalAbout: true }, '', '/about');
            pushedProject.current = true;
            setAboutOpen(true);
          }}
        >
          About
        </button>
      </div>
      <dialog
        ref={indexDialog}
        className="work-index"
        aria-labelledby="work-index-title"
        onCancel={() => setIndexOpen(false)}
        onClose={() => setIndexOpen(false)}
      >
        <div className="detail-top">
          <h2 id="work-index-title">Work index</h2>
          <button onClick={() => setIndexOpen(false)}>Close ×</button>
        </div>
        <p>Choose a work, or locate it in the signal.</p>
        {projects.map((item, i) => (
          <div className="index-row" key={item.slug}>
            <a
              href={`/projects/${item.slug}`}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                openProject(item);
              }}
            >
              <small>{String(i + 1).padStart(2, '0')}</small>
              {item.title} ↗
            </a>
            <button
              onClick={() => {
                pointerRef.current = { x: 0, y: 0 };
                resetPointer();
                enter();
                move(item.progress);
                setIndexOpen(false);
                sectionRef.current?.focus();
              }}
              aria-label={`Locate ${item.title} in the signal`}
            >
              Locate →
            </button>
          </div>
        ))}
      </dialog>
      {project && <ProjectDetail project={project} onClose={closeProject} />}
      {aboutOpen && <AboutDetail onClose={closeProject} />}
    </section>
  );
}
