export type ScreenRectangle = {
  left: number;
  right: number;
  bottom: number;
  top: number;
};
export const plaqueScreenMargin = 0.07;
const gap = 0.045;

export function rectanglesOverlap(
  first: ScreenRectangle,
  second: ScreenRectangle,
) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.bottom < second.top &&
    first.top > second.bottom
  );
}

/** Try real space beside/below the film; never clamp a large label over the image. */
export function choosePlaquePlacement(
  film: ScreenRectangle,
  width: number,
  height: number,
  occupied: ScreenRectangle[],
) {
  const centerX = (film.left + film.right) / 2;
  const centerY = (film.bottom + film.top) / 2;
  for (const scale of [1, 0.85, 0.7, 0.55, 0.4, 0.3, 0.2, 0.15, 0.1]) {
    const halfWidth = (width * scale) / 2;
    const halfHeight = (height * scale) / 2;
    const limitX = 1 - plaqueScreenMargin - halfWidth;
    const limitY = 1 - plaqueScreenMargin - halfHeight;
    const alignedX = Math.max(-limitX, Math.min(limitX, centerX));
    const alignedY = Math.max(-limitY, Math.min(limitY, centerY));
    const candidates = [
      { x: alignedX, y: film.bottom - gap - halfHeight, side: 'below' },
      { x: film.right + gap + halfWidth, y: alignedY, side: 'right' },
      { x: film.left - gap - halfWidth, y: alignedY, side: 'left' },
    ];
    for (const candidate of candidates) {
      const rectangle = {
        left: candidate.x - halfWidth,
        right: candidate.x + halfWidth,
        bottom: candidate.y - halfHeight,
        top: candidate.y + halfHeight,
      };
      if (
        rectangle.left < -1 + plaqueScreenMargin ||
        rectangle.right > 1 - plaqueScreenMargin ||
        rectangle.bottom < -1 + plaqueScreenMargin ||
        rectangle.top > 1 - plaqueScreenMargin
      )
        continue;
      if (occupied.some((other) => rectanglesOverlap(rectangle, other)))
        continue;
      return { ...candidate, rectangle, scale };
    }
  }
  return null;
}
