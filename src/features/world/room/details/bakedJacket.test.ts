import { expect, it, vi } from 'vitest';
import { Raycaster } from 'three';
import bakedJacketData from 'virtual:baked-jacket';
import { restoreBakedJacketModel } from './bakedJacket';
import { createAuthoredJacketModel } from './jacketModel';

it('restores the exact authored geometry and zipper without runtime raycasts', () => {
  const authored = createAuthoredJacketModel();
  const raycast = vi.spyOn(Raycaster.prototype, 'intersectObject');
  const restored = restoreBakedJacketModel(bakedJacketData);
  expect(raycast).not.toHaveBeenCalled();
  raycast.mockRestore();
  const authoredGeometries = [
    ...authored.torso,
    ...authored.sleeves,
    ...authored.collar,
    ...authored.seams,
    authored.pocket,
  ];
  const restoredGeometries = [
    ...restored.torso,
    ...restored.sleeves,
    ...restored.collar,
    ...restored.seams,
    restored.pocket,
  ];
  try {
    expect(restoredGeometries).toHaveLength(authoredGeometries.length);
    authoredGeometries.forEach((geometry, index) => {
      const restoredGeometry = restoredGeometries[index];
      expect(Object.keys(restoredGeometry.attributes)).toEqual(
        Object.keys(geometry.attributes),
      );
      for (const name of Object.keys(geometry.attributes)) {
        expect(restoredGeometry.attributes[name].itemSize).toBe(
          geometry.attributes[name].itemSize,
        );
        expect(restoredGeometry.attributes[name].normalized).toBe(
          geometry.attributes[name].normalized,
        );
        expect(restoredGeometry.attributes[name].array).toEqual(
          geometry.attributes[name].array,
        );
      }
      expect(restoredGeometry.index?.array).toEqual(geometry.index?.array);
    });
    expect(restored.zipper.map((point) => point.toArray())).toEqual(
      authored.zipper.map((point) => point.toArray()),
    );
  } finally {
    [...authoredGeometries, ...restoredGeometries].forEach((geometry) =>
      geometry.dispose(),
    );
  }
});
