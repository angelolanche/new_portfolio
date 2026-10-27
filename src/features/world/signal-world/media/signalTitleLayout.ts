export const titleWidth = 9;
export const titleHeight = (titleWidth * 160) / 1340;
export const titleDepth = 0.12;
export const titleHorizontalPadding = 0.42;

/** Fit the expanded block at the closest point of the automatic entry. */
export function signalTitleScale(aspect: number) {
  const fieldOfView = aspect < 1 ? 54 : 50;
  const visibleWidth =
    2 * 6.5 * Math.tan((fieldOfView * Math.PI) / 360) * aspect;
  return Math.min(
    0.86,
    (visibleWidth * 0.9) / (titleWidth + titleHorizontalPadding * 2),
  );
}
