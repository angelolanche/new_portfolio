import { spillSettings } from './spillSettings';
import { glassContactTime } from './spillMotion';

// Reference phases: a short inertial splash, followed by a cohesive main pour.
// Both simulation and meshes read the same absolute-time envelope for replay.
export function sampleWaterRelease(seconds: number) {
  const age = seconds - (glassContactTime - spillSettings.release.burstLead);
  if (age <= 0) return { burst: 0, settled: 0, extraSpeed: 0 };
  const rise = Math.min(1, age / spillSettings.release.riseTime);
  const burst =
    rise *
    Math.exp(
      -Math.max(0, age - spillSettings.release.riseTime) /
        spillSettings.release.decayTime,
    );
  const t = Math.max(
    0,
    Math.min(
      1,
      (age - spillSettings.release.settleDelay) /
        spillSettings.release.settleDuration,
    ),
  );
  return {
    burst,
    settled: t * t * (3 - 2 * t),
    extraSpeed: spillSettings.release.extraSpeed * burst,
  };
}
