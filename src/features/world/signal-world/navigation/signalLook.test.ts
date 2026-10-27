import { expect, it } from 'vitest';
import { projects } from '../../../../content/projects';
import { createFlight, type SignalNavigation } from './signalNavigation';
import { isInspectingSignalStop } from './signalLook';

it.each([0, ...projects.map((project) => project.progress), 1])(
  'inspects stop %s and releases inspection immediately on movement, offset or travel',
  (progress) => {
    const navigation: SignalNavigation = {
      progress,
      target: progress,
      reducedMotion: false,
      detailOpen: false,
      flight: createFlight(),
    };
    expect(isInspectingSignalStop(navigation)).toBe(true);
    const flight = navigation.flight!;
    flight.movement.forward = 1;
    expect(isInspectingSignalStop(navigation)).toBe(false);
    flight.movement.forward = 0;
    flight.target.x = 1;
    expect(isInspectingSignalStop(navigation)).toBe(false);
    flight.target.x = 0;
    flight.position.x = 1;
    expect(isInspectingSignalStop(navigation)).toBe(false);
    flight.position.x = 0;
    expect(isInspectingSignalStop(navigation)).toBe(true);
    navigation.target = progress === 1 ? 0 : 1;
    expect(isInspectingSignalStop(navigation)).toBe(false);
  },
);
