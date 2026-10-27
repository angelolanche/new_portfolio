// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { expect, it, vi } from 'vitest';
import { FloatingInstructionBlock } from './FloatingInstructionBlock';

const frame = vi.hoisted(() => ({ callback: () => {} }));
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: () => void) => {
    frame.callback = callback;
  },
}));

it('floats each instruction from the shared clock, freezes at unchanged time and restores on replay', () => {
  const context = { fillRect: vi.fn(), fillText: vi.fn() };
  const canvas = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  try {
    const clockRef = { current: 0 };
    const { result } = renderHook(() =>
      FloatingInstructionBlock({
        text: 'w',
        width: 2.8,
        height: 2.8,
        position: [1, 2, 3],
        seed: 241,
        clockRef,
      }),
    );
    const group = new Group();
    // The actual rendered geometry has one textured front, with no overlay plane.
    const renderedMesh = result.current.props.children;
    expect(renderedMesh.type).toBe('mesh');
    const mesh = new Mesh(renderedMesh.props.geometry, [
      new MeshBasicMaterial(),
      new MeshBasicMaterial(),
    ]);
    const hits = new Raycaster(
      new Vector3(0.1, 0.2, 5),
      new Vector3(0, 0, -1),
    ).intersectObject(mesh);
    expect(hits).toHaveLength(1);
    expect(hits[0].face?.materialIndex).toBe(1);
    expect(hits[0].face?.normal.z).toBe(1);
    for (const material of mesh.material) material.dispose();
    result.current.props.ref.current = group;
    frame.callback();
    expect(group.position.toArray()).toEqual([1, 2, 3]);
    clockRef.current = 8;
    frame.callback();
    expect(group.position.toArray()).not.toEqual([1, 2, 3]);
    const pose = group.matrix.clone();
    group.updateMatrix();
    pose.copy(group.matrix);
    frame.callback();
    group.updateMatrix();
    expect(group.matrix.equals(pose)).toBe(true);
    clockRef.current = 0;
    frame.callback();
    expect(group.position.toArray()).toEqual([1, 2, 3]);
    expect(group.rotation.toArray().slice(0, 3)).toEqual([0, 0, 0]);
  } finally {
    canvas.mockRestore();
  }
});
