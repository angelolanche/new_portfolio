export const waterGrid = {
  x: -0.91,
  z: -0.91,
  spacing: 0.026,
  columns: 71,
  rows: 71,
};
export const cellArea = waterGrid.spacing ** 2;
export function getGridCellPosition(index: number): [number, number] {
  return [
    waterGrid.x + (index % waterGrid.columns) * waterGrid.spacing,
    waterGrid.z + Math.floor(index / waterGrid.columns) * waterGrid.spacing,
  ];
}
