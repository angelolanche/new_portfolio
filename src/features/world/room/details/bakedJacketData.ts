/** Lossless build/browser contract; attributes retain their original Float32 bytes. */
export type BakedGeometryData = {
  attributes: Record<
    string,
    { encodedBytes: string; itemSize: number; normalized: boolean }
  >;
  index: { encodedBytes: string; type: 'Uint16Array' | 'Uint32Array' } | null;
};

export type BakedJacketData = {
  torso: BakedGeometryData[];
  sleeves: BakedGeometryData[];
  collar: BakedGeometryData[];
  seams: BakedGeometryData[];
  pocket: BakedGeometryData;
  zipper: [number, number, number][];
};
