import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
  type HTMLAttributes,
} from 'react';
import type { PointerLook } from './cameraLook';
import { openingDuration } from './timing';
import {
  clampProgress,
  clearFlightKeys,
  isSignalTravelling,
  nextWorkProgress,
  setFlightKey,
  setLookKey,
  type SignalNavigation,
} from '../signal-world/navigation/signalNavigation';
import { isInspectingSignalStop } from '../signal-world/navigation/signalLook';
import { useOpeningPointer } from './useOpeningPointer';

type Options = {
  pointerRef: RefObject<PointerLook>;
  navigationRef: RefObject<SignalNavigation>;
  elapsedRef: RefObject<number>;
  sectionRef: RefObject<HTMLElement | null>;
  indexDialog: RefObject<HTMLDialogElement | null>;
  entered: boolean;
  blocked: boolean;
  onOpenWork: () => void;
};

export function useOpeningControls({
  pointerRef,
  navigationRef,
  elapsedRef,
  sectionRef,
  indexDialog,
  entered,
  blocked,
  onOpenWork,
}: Options) {
  const lastWheelRef = useRef(-Infinity);
  const completedWheelTravelRef = useRef<SignalNavigation['travel']>(undefined);
  const { pointerHandlers, resetPointer } = useOpeningPointer({
    pointerRef,
    navigationRef,
    elapsedRef,
    entered,
    blocked,
    onMove: (target) => move(target),
  });
  const move = useCallback(
    (target: number) => {
      navigationRef.current.mode = 'scroll';
      navigationRef.current.lookKeys = {};
      pointerRef.current = { x: 0, y: 0 };
      resetPointer();
      const flight = navigationRef.current.flight;
      if (flight) {
        clearFlightKeys(flight);
        flight.target = { x: 0, y: 0, z: 0 };
      }
      navigationRef.current.target = clampProgress(target);
    },
    [pointerRef, navigationRef, resetPointer],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const wheel = (event: WheelEvent) => {
      if (
        elapsedRef.current < openingDuration ||
        navigationRef.current.detailOpen ||
        indexDialog.current?.open ||
        event.ctrlKey
      )
        return;
      // Capture wheel transactions even when their original target is a moving
      // label or an overlay. Horizontal trackpad gestures must never select work.
      if (event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX))
        return;
      event.preventDefault();
      if (event.deltaY === 0) return;
      const now = performance.now();
      const travel = navigationRef.current.travel;
      const arrived =
        !isSignalTravelling(navigationRef.current) &&
        travel &&
        travel !== completedWheelTravelRef.current;
      if (arrived) completedWheelTravelRef.current = travel;
      const continuingGesture = !arrived && now - lastWheelRef.current < 120;
      lastWheelRef.current = now;
      if (continuingGesture || isSignalTravelling(navigationRef.current))
        return;
      move(nextWorkProgress(navigationRef.current.target, event.deltaY));
      section?.focus({ preventScroll: true });
    };
    window.addEventListener('wheel', wheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', wheel, { capture: true });
  }, [move, elapsedRef, indexDialog, navigationRef, sectionRef]);
  const handlers: HTMLAttributes<HTMLElement> = {
    onBlur: () => {
      navigationRef.current.lookKeys = {};
      const flight = navigationRef.current.flight;
      if (flight) clearFlightKeys(flight);
    },
    onKeyUp: (event) => {
      if (setLookKey(navigationRef.current, event.key, false))
        event.preventDefault();
      const flight = navigationRef.current.flight;
      if (flight && setFlightKey(flight, event.key, false))
        event.preventDefault();
    },
    onKeyDown: (event) => {
      if (blocked || event.target !== event.currentTarget) return;
      if (!entered) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!event.repeat && !isSignalTravelling(navigationRef.current))
          onOpenWork();
        return;
      }
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        if (
          !isSignalTravelling(navigationRef.current) &&
          !isInspectingSignalStop(navigationRef.current)
        )
          setLookKey(navigationRef.current, event.key, true);
        return;
      }
      const flight = navigationRef.current.flight;
      if (
        flight &&
        !isSignalTravelling(navigationRef.current) &&
        setFlightKey(flight, event.key, true)
      ) {
        if (event.key.toLowerCase() !== 'shift')
          navigationRef.current.mode = 'free';
        event.preventDefault();
        return;
      }
      const steps: Record<string, number> = {
        PageDown: 0.15,
        PageUp: -0.15,
      };
      if (event.key in steps) {
        event.preventDefault();
        if (!isSignalTravelling(navigationRef.current))
          move(
            nextWorkProgress(navigationRef.current.target, steps[event.key]),
          );
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        move(event.key === 'Home' ? 0 : 1);
      }
    },

    ...pointerHandlers,
  };
  return { handlers, move, resetPointer };
}
