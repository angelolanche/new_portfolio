// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { DoubleSide, FrontSide } from 'three';
import { expect, it } from 'vitest';
import { RoomMaterial } from './RoomSurfaces';
import { FinishedBox } from './FinishedBox';
import { Upholstery } from '../room/details/Upholstery';

it('uses front faces only on explicitly closed models, retaining both faces on open surfaces', () => {
  const closed = renderHook(() => RoomMaterial({ closed: true })).result
    .current;
  const cane = renderHook(() => RoomMaterial({ surface: 'cane' })).result
    .current;
  const cloth = renderHook(() => RoomMaterial({ surface: 'fabric' })).result
    .current;
  expect(closed.props.side).toBe(FrontSide);
  expect(cane.props.side).toBe(DoubleSide);
  expect(cane.props.alphaTest).toBe(0.5);
  expect(cloth.props.side).toBe(DoubleSide);
  const box = renderHook(() =>
    FinishedBox({ position: [0, 0, 0], size: [1, 1, 1], color: '#fff' }),
  ).result.current;
  const cushion = renderHook(() =>
    Upholstery({ position: [0, 0, 0], size: [1, 0.3, 1] }),
  ).result.current;
  expect(box.props.children.props.closed).toBe(true);
  expect(cushion.props.children.props.closed).toBe(true);
});
