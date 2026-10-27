import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  FrontSide,
  Raycaster,
  Texture,
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
      parent.position.set(i * 0.2, i * 0.1, -i * 0.1);
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

  it('keeps distinct colors, shadows and explicitly excluded meshes separate', () => {
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

  it('groups identical untagged detail materials in local regions without changing their geometry or textures', () => {
    const root = new Group();
    const texture = new Texture();
    const sources = [0, 0.2, 6, 6.2].map((x) => {
      const material = new MeshStandardMaterial({
        color: '#b4b5aa',
        map: texture,
        metalness: 0.7,
        roughness: 0.35,
      });
      const mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), material);
      // R3F attaches cyclic reconciler metadata to real browser materials.
      Object.assign(material, { __r3f: { object: material, parent: root } });
      mesh.position.x = x;
      root.add(mesh);
      return mesh;
    });
    const cleanup = batchStaticRoom(root);
    const batches = root.children.filter(
      (o) => o instanceof Mesh && !sources.includes(o),
    );
    expect(batches).toHaveLength(2);
    for (const mesh of batches as Mesh<BoxGeometry, MeshStandardMaterial>[]) {
      expect(mesh.material.map).toBe(texture);
      expect(mesh.geometry.getAttribute('position').count).toBe(
        sources[0].geometry.getAttribute('position').count * 2,
      );
      const size = new Box3().setFromObject(mesh).getSize(new Vector3());
      expect(size.x).toBeLessThan(0.31);
    }
    expect(sources.every((o) => !o.visible)).toBe(true);
    cleanup();
    expect(root.children).toEqual(sources);
    sources.forEach((o) => {
      o.geometry.dispose();
      o.material.dispose();
    });
    texture.dispose();
  });

  it.each([true, false])(
    'preserves front faces, normals and source data when baking mirrored meshes (indexed=%s)',
    (indexed) => {
      const root = new Group();
      const material = new MeshStandardMaterial({ side: FrontSide });
      const geometry = new BoxGeometry(0.2, 0.3, 0.4);
      const model = indexed ? geometry : geometry.toNonIndexed();
      const original = Array.from(model.getAttribute('position').array);
      const sources = [-0.25, 0.25].map((x, i) => {
        const mesh = new Mesh(model, material);
        mesh.position.x = x;
        if (i === 1) mesh.scale.x = -1;
        root.add(mesh);
        return mesh;
      });
      const cleanup = batchStaticRoom(root);
      const merged = root.children.find(
        (o) => o instanceof Mesh && !sources.includes(o),
      ) as Mesh;
      expect(merged).toBeDefined();
      root.updateWorldMatrix(true, true);
      for (const x of [-0.25, 0.25]) {
        const hits = new Raycaster(
          new Vector3(x, 0, 2),
          new Vector3(0, 0, -1),
        ).intersectObject(merged);
        expect(hits[0].point.z).toBeCloseTo(0.2, 6);
        expect(hits[0].normal!.z).toBeGreaterThan(0.99);
      }
      expect(Array.from(model.getAttribute('position').array)).toEqual(
        original,
      );
      cleanup();
      expect(sources.every((o) => o.visible)).toBe(true);
      geometry.dispose();
      if (model !== geometry) model.dispose();
      material.dispose();
    },
  );

  it('keeps physical, transparent, custom shader and animated subtrees outside the batch', () => {
    const root = new Group(),
      moving = new Group();
    moving.userData.roomBatch = false;
    const custom = new MeshStandardMaterial();
    custom.onBeforeCompile = () => {};
    const materials = [
      new MeshPhysicalMaterial(),
      new MeshStandardMaterial({ transparent: true }),
      custom,
    ];
    for (const material of materials)
      for (let i = 0; i < 2; i++)
        root.add(new Mesh(new BoxGeometry(), material));
    for (let i = 0; i < 2; i++)
      moving.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
    root.add(moving);
    const before = [...root.children];
    const cleanup = batchStaticRoom(root);
    expect(root.children).toEqual(before);
    expect(moving.children.every((o) => o.visible)).toBe(true);
    cleanup();
    root.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
  });

  it('does not combine differing render contracts or geometry layouts', () => {
    const root = new Group(),
      material = new MeshStandardMaterial();
    const variants = [
      new MeshStandardMaterial({ wireframe: true }),
      new MeshStandardMaterial({ depthWrite: false }),
      new MeshStandardMaterial(),
      new MeshStandardMaterial(),
    ];
    variants[2].envMapRotation.y = 0.1;
    variants[3].normalScale.x = 0.5;
    const sources = variants.map((m) => new Mesh(new BoxGeometry(), m));
    const layer = new Mesh(new BoxGeometry(), material);
    layer.layers.set(1);
    const cropped = new Mesh(new BoxGeometry(), material);
    cropped.geometry.setDrawRange(0, 6);
    const base = new Mesh(new BoxGeometry(), material);
    root.add(...sources, layer, cropped, base);
    const cleanup = batchStaticRoom(root);
    expect(root.children).toHaveLength(7);
    expect(root.children.every((o) => o.visible)).toBe(true);
    cleanup();
    root.children.forEach((o) => {
      const mesh = o as Mesh<BoxGeometry, MeshStandardMaterial>;
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  });
});
