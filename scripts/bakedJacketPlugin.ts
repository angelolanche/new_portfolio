import type { BufferGeometry } from 'three';
import type { Plugin } from 'vite';
import { createAuthoredJacketModel } from '../src/features/world/room/details/jacketModel.ts';
import type {
  BakedJacketData,
  BakedGeometryData,
} from '../src/features/world/room/details/bakedJacketData.ts';

const publicModuleId = 'virtual:baked-jacket';
const resolvedModuleId = `\0${publicModuleId}`;

function encodeBufferToBase64(array: ArrayBufferView) {
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength).toString(
    'base64',
  );
}

function serializeJacketGeometry(geometry: BufferGeometry): BakedGeometryData {
  const attributes: BakedGeometryData['attributes'] = {};
  for (const [attributeName, attribute] of Object.entries(
    geometry.attributes,
  )) {
    if (!(attribute.array instanceof Float32Array))
      throw new Error(`Unsupported jacket attribute: ${attributeName}`);
    attributes[attributeName] = {
      encodedBytes: encodeBufferToBase64(attribute.array),
      itemSize: attribute.itemSize,
      normalized: attribute.normalized,
    };
  }
  const geometryIndex = geometry.index;
  if (
    geometryIndex &&
    !(
      geometryIndex.array instanceof Uint16Array ||
      geometryIndex.array instanceof Uint32Array
    )
  )
    throw new Error('Unsupported jacket index');
  return {
    attributes,
    index: geometryIndex
      ? {
          encodedBytes: encodeBufferToBase64(geometryIndex.array),
          type:
            geometryIndex.array instanceof Uint16Array
              ? 'Uint16Array'
              : 'Uint32Array',
        }
      : null,
  };
}

function bakeJacketModel(): BakedJacketData {
  const authoredModel = createAuthoredJacketModel();
  try {
    return {
      torso: authoredModel.torso.map(serializeJacketGeometry),
      sleeves: authoredModel.sleeves.map(serializeJacketGeometry),
      collar: authoredModel.collar.map(serializeJacketGeometry),
      seams: authoredModel.seams.map(serializeJacketGeometry),
      pocket: serializeJacketGeometry(authoredModel.pocket),
      zipper: authoredModel.zipper.map((position) => position.toArray()),
    };
  } finally {
    // Serialization does not own its input. Release all authored buffers,
    // even when validation of a later attribute fails.
    [
      ...authoredModel.torso,
      ...authoredModel.sleeves,
      ...authoredModel.collar,
      ...authoredModel.seams,
      authoredModel.pocket,
    ].forEach((geometry) => geometry.dispose());
  }
}

export function bakedJacketPlugin(): Plugin {
  return {
    name: 'baked-jacket',
    resolveId(requestedModuleId) {
      if (requestedModuleId === publicModuleId) return resolvedModuleId;
    },
    load(requestedModuleId) {
      if (requestedModuleId !== resolvedModuleId) return;
      return `export default ${JSON.stringify(bakeJacketModel())};`;
    },
  };
}
