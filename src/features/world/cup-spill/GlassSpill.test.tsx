// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { GlassSpill } from './GlassSpill';
import { TableWaterSimulation } from './tableWater';
import * as tabletop from './tabletopWaterMesh';
import { tablePosition } from '../room/sceneLayout';

const frame = vi.hoisted(() => ({
  callback: null as unknown as (state: { camera: PerspectiveCamera }) => void,
}));
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: typeof frame.callback) => {
    frame.callback = callback;
  },
}));
afterEach(() => vi.restoreAllMocks());

it('skips invisible mesh work while preserving physics and refreshes when looking back', () => {
  const advance = vi.spyOn(TableWaterSimulation.prototype, 'advance');
  const updateSurface = vi.spyOn(tabletop, 'updateTabletopWaterMesh');
  const elapsedRef = { current: 0 };
  const { result } = renderHook(() => GlassSpill({ elapsedRef }));
  // Attach actual Three objects to the component's refs, without a GPU or DOM
  // stand-ins. The frame callback and geometry builders remain the real code.
  const element = result.current;
  const root = new Group();
  root.position.set(...tablePosition);
  element.props.ref.current = root;
  const [glassElement, surfaceElement, streamElement, cascadeElement] =
    element.props.children;
  const glass = new Group();
  glassElement.props.ref.current = glass;
  root.add(glass);
  const material = new MeshBasicMaterial();
  const cupElement = glassElement.props.children[1];
  cupElement.props.ref.current = new Mesh(cupElement.props.geometry, material);
  const attach = (child: typeof surfaceElement) => {
    const mesh = new Mesh(child.props.geometry, material);
    child.props.ref.current = mesh;
    root.add(mesh);
    return mesh;
  };
  const surface = attach(surfaceElement);
  attach(streamElement);
  attach(cascadeElement);
  const camera = new PerspectiveCamera(60, 16 / 9, 0.03, 400);
  camera.position.set(tablePosition[0], 2, tablePosition[2] + 5);
  const target = new Vector3(...tablePosition).add(new Vector3(0, 0.85, 0));
  camera.lookAt(target);
  frame.callback({ camera });
  expect(surface.geometry.drawRange.count).toBe(0);
  elapsedRef.current = 4;
  frame.callback({ camera });
  expect(surface.geometry.drawRange.count).toBeGreaterThan(0);
  const updates = updateSurface.mock.calls.length;
  camera.lookAt(camera.position.clone().add(new Vector3(0, 0, 5)));
  elapsedRef.current = 6;
  frame.callback({ camera });
  expect(surface.visible).toBe(false);
  expect(updateSurface).toHaveBeenCalledTimes(updates);
  const actual = advance.mock.contexts[0] as TableWaterSimulation;
  const expected = new TableWaterSimulation();
  expected.advance(6);
  expect(actual.waterDepths).toEqual(expected.waterDepths);
  expect(actual.escapedVolume).toBe(expected.escapedVolume);
  camera.lookAt(target);
  frame.callback({ camera });
  expect(surface.visible).toBe(true);
  expect(updateSurface).toHaveBeenCalledTimes(updates + 1);
  frame.callback({ camera });
  expect(updateSurface).toHaveBeenCalledTimes(updates + 1);
  expect(element.props.children).toHaveLength(4);
  material.dispose();
});
