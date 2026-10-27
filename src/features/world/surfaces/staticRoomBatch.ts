import {
  Group,
  Box3,
  Matrix4,
  Mesh,
  Object3D,
  Vector3,
  type MeshStandardMaterial,
  type BufferAttribute,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { roomBatchMaterialKey } from './roomBatchMaterial';

// This subtree is static. Opaque standard detail materials may join RoomMaterial;
// animated furniture, water, glass and lights remain outside the subtree/batch.
const cellSize = 1.5;

function reverseWinding(geometry: BufferGeometry) {
  const index = geometry.getIndex();
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const b = index.getX(i + 1);
      index.setX(i + 1, index.getX(i + 2));
      index.setX(i + 2, b);
    }
  } else {
    for (const attribute of Object.values(
      geometry.attributes,
    ) as BufferAttribute[]) {
      const { array, itemSize, count } = attribute;
      for (let i = 0; i < count; i += 3)
        for (let j = 0; j < itemSize; j++) {
          const b = (i + 1) * itemSize + j,
            c = (i + 2) * itemSize + j;
          const value = array[b];
          array[b] = array[c];
          array[c] = value;
        }
    }
  }
}
export function batchStaticRoom(root: Group) {
  root.updateWorldMatrix(true, true);
  const inverse = new Matrix4().copy(root.matrixWorld).invert();
  const transform = new Matrix4();
  const bounds = new Box3(),
    center = new Vector3();
  const materials = new Map<MeshStandardMaterial, string | null>();
  const buckets = new Map<
    string,
    {
      material: MeshStandardMaterial;
      meshes: Mesh[];
      cast: boolean;
      receive: boolean;
      layers: number;
      order: number;
      groupOrder: number;
    }
  >();
  function collect(object: Object3D, groupOrder: number) {
    if (!object.visible || object.userData.roomBatch === false) return;
    const order = object instanceof Group ? object.renderOrder : groupOrder;
    if (object instanceof Mesh) add(object, order);
    for (const child of object.children) collect(child, order);
  }
  function add(object: Mesh, groupOrder: number) {
    if (
      object.type !== 'Mesh' ||
      object.animations.length ||
      object.morphTargetInfluences?.length ||
      object.onBeforeRender !== Mesh.prototype.onBeforeRender ||
      object.onAfterRender !== Mesh.prototype.onAfterRender ||
      object.onBeforeShadow !== Mesh.prototype.onBeforeShadow ||
      object.onAfterShadow !== Mesh.prototype.onAfterShadow
    )
      return;
    const material = object.material;
    if (Array.isArray(material)) return;
    const standard = material as MeshStandardMaterial;
    if (!materials.has(standard))
      materials.set(standard, roomBatchMaterialKey(material));
    const materialKey = materials.get(standard);
    if (materialKey === null || materialKey === undefined) return;
    const geometry = object.geometry;
    if (
      geometry.drawRange.start !== 0 ||
      geometry.drawRange.count !== Infinity ||
      Object.keys(geometry.morphAttributes).length ||
      Object.values(geometry.attributes).some(
        (a) => 'isInterleavedBufferAttribute' in a,
      )
    )
      return;
    transform.multiplyMatrices(inverse, object.matrixWorld);
    // Mirrored tangent-space normal maps need a separate handedness contract.
    if (transform.determinant() < 0 && geometry.hasAttribute('tangent')) return;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    bounds
      .copy(geometry.boundingBox!)
      .applyMatrix4(transform)
      .getCenter(center);
    const key = JSON.stringify([
      materialKey,
      Math.floor(center.x / cellSize + 0.5),
      Math.floor(center.y / cellSize + 0.5),
      Math.floor(center.z / cellSize + 0.5),
      object.castShadow,
      object.receiveShadow,
      object.layers.mask,
      object.renderOrder,
      groupOrder,
      Boolean(object.geometry.index),
      Object.entries(geometry.attributes)
        .map(([name, a]) => [
          name,
          a.itemSize,
          a.normalized,
          a.array.constructor.name,
        ])
        .sort(),
    ]);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        material: standard,
        meshes: [],
        cast: object.castShadow,
        receive: object.receiveShadow,
        layers: object.layers.mask,
        order: object.renderOrder,
        groupOrder,
      };
      buckets.set(key, bucket);
    }
    bucket.meshes.push(object);
  }
  collect(root, root.renderOrder);
  const merged: Mesh[] = [];
  const hidden: Mesh[] = [];
  for (const bucket of buckets.values()) {
    // Collect first: singleton buckets need neither a clone nor an upload.
    if (bucket.meshes.length > 1) {
      const sources = bucket.meshes.map((mesh) => {
        transform.multiplyMatrices(inverse, mesh.matrixWorld);
        const geometry = mesh.geometry.clone().applyMatrix4(transform);
        // Baking a negative transform removes the renderer's automatic winding
        // flip. Restore it explicitly so mirrored shoes keep fronts and normals.
        if (transform.determinant() < 0) reverseWinding(geometry);
        return geometry;
      });
      // Compatible index layouts share a bucket, preserving indexed vertices
      // instead of expanding every triangle into three independent vertices.
      const geometry = mergeGeometries(sources);
      sources.forEach((source) => source.dispose());
      if (geometry) {
        const mesh = new Mesh(geometry, bucket.material);
        mesh.castShadow = bucket.cast;
        mesh.receiveShadow = bucket.receive;
        mesh.layers.mask = bucket.layers;
        mesh.renderOrder = bucket.order;
        // Retain the nearest group's render order, not just the mesh order.
        if (bucket.groupOrder === root.renderOrder) root.add(mesh);
        else {
          const batchParent = new Group();
          batchParent.renderOrder = bucket.groupOrder;
          batchParent.add(mesh);
          root.add(batchParent);
        }
        merged.push(mesh);
        for (const original of bucket.meshes) {
          original.visible = false;
          hidden.push(original);
        }
      }
    }
  }
  return () => {
    hidden.forEach((mesh) => {
      mesh.visible = true;
    });
    merged.forEach((mesh) => {
      const parent = mesh.parent;
      parent?.remove(mesh);
      if (parent !== root) parent?.removeFromParent();
      mesh.geometry.dispose();
    });
  };
}
