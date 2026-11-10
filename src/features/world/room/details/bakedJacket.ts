import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import type { BakedGeometryData, BakedJacketData } from './bakedJacketData';

function decodeBase64Buffer(encodedBytes: string) {
  return Uint8Array.from(atob(encodedBytes), (character) =>
    character.charCodeAt(0),
  ).buffer;
}

function restoreGeometryBuffers(geometryData: BakedGeometryData) {
  const geometry = new BufferGeometry();
  for (const [name, attribute] of Object.entries(geometryData.attributes))
    geometry.setAttribute(
      name,
      new BufferAttribute(
        new Float32Array(decodeBase64Buffer(attribute.encodedBytes)),
        attribute.itemSize,
        attribute.normalized,
      ),
    );
  if (geometryData.index) {
    const IndexArray =
      geometryData.index.type === 'Uint16Array' ? Uint16Array : Uint32Array;
    geometry.setIndex(
      new BufferAttribute(
        new IndexArray(decodeBase64Buffer(geometryData.index.encodedBytes)),
        1,
      ),
    );
  }
  return geometry;
}

/** Restore exact authored buffers; no raycasts, tessellation or normal generation. */
export function restoreBakedJacketModel(bakedJacket: BakedJacketData) {
  return {
    torso: bakedJacket.torso.map(restoreGeometryBuffers),
    sleeves: bakedJacket.sleeves.map(restoreGeometryBuffers),
    collar: bakedJacket.collar.map(restoreGeometryBuffers),
    seams: bakedJacket.seams.map(restoreGeometryBuffers),
    pocket: restoreGeometryBuffers(bakedJacket.pocket),
    zipper: bakedJacket.zipper.map((position) => new Vector3(...position)),
  };
}
