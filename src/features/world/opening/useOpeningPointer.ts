import {
  useCallback,
  useRef,
  type RefObject,
  type HTMLAttributes,
} from 'react';
import type { PointerLook } from './cameraLook';
import { openingDuration } from './timing';
import {
  isSignalTravelling,
  nextWorkProgress,
  type SignalNavigation,
} from '../signal-world/navigation/signalNavigation';
import {
  cameraSensitivityScale,
  pointerLookSensitivity,
  isInspectingSignalStop,
} from '../signal-world/navigation/signalLook';

type Options = {
  pointerRef: RefObject<PointerLook>;
  navigationRef: RefObject<SignalNavigation>;
  elapsedRef: RefObject<number>;
  entered: boolean;
  touchDevice: boolean;
  blocked: boolean;
  onMove: (target: number) => void;
};
export function useOpeningPointer({
  pointerRef,
  navigationRef,
  elapsedRef,
  entered,
  touchDevice,
  blocked,
  onMove,
}: Options) {
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const touchesRef = useRef(
    new Map<
      number,
      { x: number; y: number; travelY?: number; travelled?: boolean }
    >(),
  );
  const resetPointer = useCallback(() => {
    lastPointerRef.current = null;
  }, []);
  const pointerHandlers: HTMLAttributes<HTMLElement> = {
    onPointerDown: (event) => {
      if (
        entered &&
        !blocked &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('button, a, input')
        )
      )
        event.currentTarget.focus({ preventScroll: true });
      if (
        event.pointerType !== 'touch' ||
        !entered ||
        blocked ||
        (event.target instanceof HTMLElement &&
          event.target.closest('button, a, input'))
      )
        return;
      if (touchDevice) return;
      touchesRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerUp: (event) => {
      touchesRef.current.delete(event.pointerId);
    },
    onPointerCancel: (event) => {
      touchesRef.current.delete(event.pointerId);
    },
    onPointerMove: (event) => {
      if (blocked) {
        lastPointerRef.current = null;
        return;
      }
      if (isSignalTravelling(navigationRef.current)) {
        pointerRef.current = { x: 0, y: 0 };
        lastPointerRef.current = null;
        const touch = touchesRef.current.get(event.pointerId);
        if (touch) {
          touch.x = event.clientX;
          touch.y = event.clientY;
          touch.travelY = 0;
        }
        return;
      }
      if (event.pointerType === 'touch') {
        if (touchDevice) return;
        const touch = touchesRef.current.get(event.pointerId);
        if (touch) {
          const width = event.currentTarget.clientWidth || 400;
          pointerRef.current.x +=
            (((touch.x - event.clientX) / width) * pointerLookSensitivity) /
            touchesRef.current.size;
          if (touchesRef.current.size > 1) {
            touch.travelY = 0;
            const height = event.currentTarget.clientHeight || 600;
            pointerRef.current.y = Math.max(
              -1,
              Math.min(
                1,
                pointerRef.current.y +
                  (((touch.y - event.clientY) / height) *
                    pointerLookSensitivity) /
                    touchesRef.current.size,
              ),
            );
          } else {
            touch.travelY = (touch.travelY ?? 0) + touch.y - event.clientY;
            if (!touch.travelled && Math.abs(touch.travelY) >= 30) {
              touch.travelled = true;
              onMove(
                nextWorkProgress(navigationRef.current.target, touch.travelY),
              );
            }
          }
          if (isInspectingSignalStop(navigationRef.current)) {
            pointerRef.current.x = Math.max(
              -1,
              Math.min(1, pointerRef.current.x),
            );
          }
          touch.x = event.clientX;
          touch.y = event.clientY;
        }
        return;
      }
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button, a, [data-camera-controls]')
      ) {
        lastPointerRef.current = null;
        return;
      }
      const bounds = event.currentTarget.getBoundingClientRect();
      if (elapsedRef.current >= openingDuration) {
        if (isInspectingSignalStop(navigationRef.current)) {
          const previous = lastPointerRef.current;
          if (previous && bounds.width && bounds.height) {
            pointerRef.current.x = Math.max(
              -1,
              Math.min(
                1,
                pointerRef.current.x +
                  ((event.clientX - previous.x) / bounds.width) *
                    pointerLookSensitivity,
              ),
            );
            pointerRef.current.y = Math.max(
              -1,
              Math.min(
                1,
                pointerRef.current.y +
                  ((event.clientY - previous.y) / bounds.height) *
                    pointerLookSensitivity,
              ),
            );
          }
          lastPointerRef.current = { x: event.clientX, y: event.clientY };
        } else lastPointerRef.current = null;
        return;
      }
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      if (bounds.width && bounds.height)
        pointerRef.current = {
          x:
            (((event.clientX - bounds.left) / bounds.width) * 2 - 1) *
            cameraSensitivityScale,
          y:
            (((event.clientY - bounds.top) / bounds.height) * 2 - 1) *
            cameraSensitivityScale,
        };
    },
    onPointerLeave: (event) => {
      lastPointerRef.current = null;
      if (
        !navigationRef.current.detailOpen &&
        event.pointerType !== 'touch' &&
        elapsedRef.current < openingDuration
      )
        pointerRef.current = { x: 0, y: 0 };
      touchesRef.current.delete(event.pointerId);
    },
  };
  return { pointerHandlers, resetPointer };
}
