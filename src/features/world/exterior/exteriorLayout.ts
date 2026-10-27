// A single curved photographic backdrop in world coordinates, beyond the veranda.
// Its arc covers both openings throughout the room path; no image is attached to glass.
export const exteriorBackdrop = {
  position: [0, 1.5, 0] as [number, number, number],
  radius: 90,
  start: 2.5,
  arc: 3.4,
  height: (90 * 3.4 * 9) / 16,
};
export const porchPillars = [-3.5, 1.5, 4.6];
export const porchBeamPosition: [number, number, number] = [-5.13, 2.68, 0.65];
export const porchBeamSize: [number, number, number] = [0.3, 0.26, 8.5];
