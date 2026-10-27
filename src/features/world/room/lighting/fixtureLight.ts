// Abrupt contact failures separated by long steady intervals, on the playback clock.
// No random frame noise: scene suspension and reduced motion remain deterministic.
export function sampleFixtureIntensity(time: number): number {
  const failures = [
    [1.85, 1.92, 0.015],
    [2.4, 2.45, 0.2],
    [6.1, 6.19, 0],
    [10.6, 10.66, 0.04],
    [12.35, 12.43, 0.12],
  ];
  for (const [start, end, level] of failures) {
    if (time >= start && time < end) return level;
  }
  return 0.96 + Math.sin(time * 1.7) * 0.025;
}
