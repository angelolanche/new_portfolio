import { Children, isValidElement, type ReactNode } from 'react';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from 'three';
import { expect, it } from 'vitest';
import { FinishedBox } from '../surfaces/FinishedBox';
import { WindowSpace } from '../exterior/WindowSpace';
import { SideWindow } from './RoomOpenings';
import { RoomShell } from './RoomShell';
import { doorBack, sideWindowPosition } from './sceneLayout';

type TransformProps = {
  children?: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  size?: [number, number, number];
};

// Read the actual component tree rather than recreating its layout formulas.
// Rounded edges and material shading are irrelevant to aperture obstruction.
function openingGeometry(tree: ReactNode) {
  const root = new Group();
  const material = new MeshBasicMaterial();
  const geometries: BoxGeometry[] = [];
  const visit = (children: ReactNode, parent: Group) => {
    Children.forEach(children, (node) => {
      if (!isValidElement<TransformProps>(node)) return;
      if (node.type === WindowSpace) {
        visit(WindowSpace(), parent);
        return;
      }
      const props = node.props;
      const group = new Group();
      if (props.position) group.position.set(...props.position);
      if (props.rotation) group.rotation.set(...props.rotation);
      if (typeof props.scale === 'number') group.scale.setScalar(props.scale);
      else if (props.scale) group.scale.set(...props.scale);
      parent.add(group);
      if (node.type === FinishedBox) {
        const geometry = new BoxGeometry(...props.size!);
        geometries.push(geometry);
        group.add(new Mesh(geometry, material));
      } else visit(props.children, group);
    });
  };
  visit(tree, root);
  root.updateMatrixWorld(true);
  return {
    root,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
    },
  };
}

it('renders a wider opening toward the former picture while retaining its back edge and door clearance', () => {
  const window = openingGeometry(SideWindow());
  const wall = openingGeometry(RoomShell());
  try {
    const bounds = new Box3().setFromObject(window.root);
    // Expansion is toward the door (positive Z), with the far edge retained.
    expect(bounds.min.z).toBeCloseTo(-1.9525);
    expect(bounds.max.z).toBeGreaterThan(0.9);
    expect(doorBack - bounds.max.z).toBeGreaterThan(0.7);
    expect(bounds.min.y).toBeCloseTo(0.647);
    expect(bounds.max.y).toBeCloseTo(2.618);

    const raycaster = new Raycaster();
    // Sample glazing in both halves, especially the newly opened door side.
    for (const z of [-1.45, -1.1, -0.8, -0.2, 0.15, 0.45, 0.6]) {
      for (const y of [1.25, 1.5, 1.95, 2.2]) {
        raycaster.set(new Vector3(0, y, z), new Vector3(-1, 0, 0));
        raycaster.far = 3;
        expect(
          raycaster.intersectObject(wall.root, true),
          `wall covers ${y}, ${z}`,
        ).toHaveLength(0);
        expect(
          raycaster.intersectObject(window.root, true),
          `trim covers ${y}, ${z}`,
        ).toHaveLength(0);
      }
    }
    // Frames must remain visible along both outside uprights.
    for (const z of [
      sideWindowPosition[2] - 1.365,
      sideWindowPosition[2] + 1.365,
    ]) {
      raycaster.set(new Vector3(0, 1.5, z), new Vector3(-1, 0, 0));
      expect(
        raycaster.intersectObject(window.root, true).length,
      ).toBeGreaterThan(0);
    }
  } finally {
    window.dispose();
    wall.dispose();
  }
});
