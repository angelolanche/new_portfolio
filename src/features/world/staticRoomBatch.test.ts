import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { batchStaticRoom } from './staticRoomBatch';

describe('static room batching', () => {
  it('preserves world bounds through nested transforms and restores sources on cleanup', () => {
    const root = new Group();
    root.position.set(3, 0, -2);
    root.rotation.y = 0.4;
    const material = new MeshStandardMaterial({ color: '#886644' });
    material.userData.roomBatch = true;
    const sources = [0, 1, 2].map((i) => {
      const parent = new Group();
      parent.position.set(i * 2, i * 0.2, -i);
      parent.rotation.z = i * 0.1;
      const mesh = new Mesh(new BoxGeometry(1, 0.5, 0.8), material);
      mesh.castShadow = true;
      parent.add(mesh);
      root.add(parent);
      return mesh;
    });
    root.updateWorldMatrix(true, true);
    const bounds = new Box3();
    for (const source of sources)
      bounds.union(new Box3().setFromObject(source, true));
    const cleanup = batchStaticRoom(root);
    const merged = root.children.find((child) => child instanceof Mesh) as Mesh;
    expect(merged).toBeDefined();
    expect(sources.every((mesh) => !mesh.visible)).toBe(true);
    expect(merged.castShadow).toBe(true);
    expect(merged.geometry.index).not.toBeNull();
    expect(merged.geometry.getAttribute('position').count).toBe(
      sources.reduce(
        (sum, mesh) => sum + mesh.geometry.getAttribute('position').count,
        0,
      ),
    );
    const result = new Box3().setFromObject(merged, true);
    expect(result.min.distanceTo(bounds.min)).toBeLessThan(1e-6);
    expect(result.max.distanceTo(bounds.max)).toBeLessThan(1e-6);
    cleanup();
    expect(sources.every((mesh) => mesh.visible)).toBe(true);
    expect(root.children).toHaveLength(3);
    // StrictMode/remount may batch again; no accumulated geometry or transforms.
    const cleanupAgain = batchStaticRoom(root);
    expect(root.children).toHaveLength(4);
    cleanupAgain();
    sources.forEach((source) => source.geometry.dispose());
    material.dispose();
  });

  it('does not expose meshes beneath hidden parents or clone singleton geometry', () => {
    const root = new Group();
    const hidden = new Group();
    hidden.visible = false;
    const material = new MeshStandardMaterial();
    material.userData.roomBatch = true;
    const geometry = new BoxGeometry();
    const visible = new Mesh(geometry, material);
    const concealed = new Mesh(geometry, material);
    hidden.add(concealed);
    root.add(hidden, visible);
    const clone = vi.spyOn(geometry, 'clone');
    const cleanup = batchStaticRoom(root);
    expect(root.children).toEqual([hidden, visible]);
    expect(clone).not.toHaveBeenCalled();
    cleanup();
    expect(hidden.visible).toBe(false);
    geometry.dispose();
    material.dispose();
  });

  it('keeps distinct colors, shadows and untagged animated meshes separate', () => {
    const root = new Group();
    for (const [color, cast, tagged] of [
      ['#aa8844', true, true],
      ['#aa8844', false, true],
      ['#884422', true, true],
      ['#aa8844', true, false],
    ] as const) {
      const material = new MeshStandardMaterial({ color });
      material.userData.roomBatch = tagged;
      const mesh = new Mesh(new BoxGeometry(), material);
      mesh.castShadow = cast;
      root.add(mesh);
    }
    const cleanup = batchStaticRoom(root);
    expect(root.children).toHaveLength(4);
    expect(root.children.every((mesh) => mesh.visible)).toBe(true);
    const animated = root.children[3];
    animated.position.copy(new Vector3(2, 0, 0));
    expect(animated.position.x).toBe(2);
    cleanup();
    root.children.forEach((object) => {
      const mesh = object as Mesh<BoxGeometry, MeshStandardMaterial>;
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  });
});
