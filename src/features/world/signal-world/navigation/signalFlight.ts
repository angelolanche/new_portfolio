import { Vector3, type Quaternion } from 'three';
import type { SignalFlight } from './signalNavigation';

const direction = new Vector3();
const right = new Vector3();

export function advanceFlight(
  flight: SignalFlight,
  orientation: Quaternion,
  delta: number,
  immediate: boolean,
) {
  const dt = Math.max(0, Math.min(0.1, delta));
  direction.set(0, 0, -flight.movement.forward).applyQuaternion(orientation);
  right.set(flight.movement.right, 0, 0).applyQuaternion(orientation);
  direction.add(right);
  direction.y += flight.movement.up;
  if (direction.lengthSq() > 1) direction.normalize();
  const speed = flight.keys.shift ? 36 : 18;
  flight.target.x += direction.x * speed * dt;
  flight.target.y += direction.y * speed * dt;
  flight.target.z += direction.z * speed * dt;
  const radius = Math.hypot(flight.target.x, flight.target.y, flight.target.z);
  if (radius > 100) {
    const weight = 100 / radius;
    flight.target.x *= weight;
    flight.target.y *= weight;
    flight.target.z *= weight;
  }
  const blend = immediate ? 1 : 1 - Math.exp(-8 * dt);
  flight.position.x += (flight.target.x - flight.position.x) * blend;
  flight.position.y += (flight.target.y - flight.position.y) * blend;
  flight.position.z += (flight.target.z - flight.position.z) * blend;
}
