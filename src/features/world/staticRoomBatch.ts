import {
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Only opt-in RoomMaterial meshes: their complete material contract is below.
// Animated furniture, water, glass and lights stay outside this static batch.
export function batchStaticRoom(root: Group) {
  root.updateWorldMatrix(true, true);
  const inverse = new Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<
    string,
    {
      material: MeshStandardMaterial;
      meshes: Mesh[];
      cast: boolean;
      receive: boolean;
    }
  >();
  root.traverseVisible((object) => {
    if (!(object instanceof Mesh) || !object.visible) return;
    const material = object.material;
    if (
      !(material instanceof MeshStandardMaterial) ||
      !material.userData.roomBatch
    )
      return;
    const key = JSON.stringify([
      material.color.getHex(),
      material.emissive.getHex(),
      material.emissiveIntensity,
      material.roughness,
      material.metalness,
      material.bumpScale,
      material.envMapIntensity,
      material.alphaTest,
      material.side,
      material.map?.uuid,
      material.bumpMap?.uuid,
      material.envMap?.uuid,
      object.castShadow,
      object.receiveShadow,
      Boolean(object.geometry.index),
      Object.keys(object.geometry.attributes).sort(),
    ]);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        material,
        meshes: [],
        cast: object.castShadow,
        receive: object.receiveShadow,
      };
      buckets.set(key, bucket);
    }
    bucket.meshes.push(object);
  });
  const merged: Mesh[] = [];
  const hidden: Mesh[] = [];
  const transform = new Matrix4();
  for (const bucket of buckets.values()) {
    // Collect first: singleton buckets need neither a clone nor an upload.
    if (bucket.meshes.length > 1) {
      const sources: BufferGeometry[] = bucket.meshes.map((mesh) =>
        mesh.geometry
          .clone()
          .applyMatrix4(transform.multiplyMatrices(inverse, mesh.matrixWorld)),
      );
      // Compatible index layouts share a bucket, preserving indexed vertices
      // instead of expanding every triangle into three independent vertices.
      const geometry = mergeGeometries(sources);
      sources.forEach((source) => source.dispose());
      if (geometry) {
        const mesh = new Mesh(geometry, bucket.material);
        mesh.castShadow = bucket.cast;
        mesh.receiveShadow = bucket.receive;
        root.add(mesh);
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
      root.remove(mesh);
      mesh.geometry.dispose();
    });
  };
}
