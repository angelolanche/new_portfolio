import { expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { advanceFlight } from './signalFlight';
import {
  clearFlightKeys,
  createFlight,
  setFlightKey,
} from './signalNavigation';

it('flies along the viewing direction, combines keys, stops on blur and smoothly returns to the thread', () => {
  const flight = createFlight();
  const rotation = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    Math.PI / 2,
  );
  setFlightKey(flight, 'w', true);
  for (let i = 0; i < 60; i++) advanceFlight(flight, rotation, 1 / 60, false);
  expect(flight.position.x).toBeLessThan(-15);
  expect(Math.abs(flight.position.z)).toBeLessThan(1e-8);
  setFlightKey(flight, 's', true);
  expect(flight.movement.forward).toBe(0);
  setFlightKey(flight, 's', false);
  expect(flight.movement.forward).toBe(1);
  clearFlightKeys(flight);
  const target = { ...flight.target };
  advanceFlight(flight, rotation, 1 / 60, false);
  expect(flight.target).toEqual(target);
  flight.target = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < 120; i++) advanceFlight(flight, rotation, 1 / 60, false);
  expect(
    Math.hypot(flight.position.x, flight.position.y, flight.position.z),
  ).toBeLessThan(0.001);
});

it('bounds free travel, supports vertical movement and resets deterministically', () => {
  const flight = createFlight();
  setFlightKey(flight, 'e', true);
  setFlightKey(flight, 'Shift', true);
  for (let i = 0; i < 200; i++)
    advanceFlight(flight, new Quaternion(), 0.1, true);
  expect(flight.position.y).toBe(100);
  expect(createFlight().position).toEqual({ x: 0, y: 0, z: 0 });
});
