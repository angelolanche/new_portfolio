import {
  ConeGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** A spherical red core and needle corona, following the owner's sun reference. */
export function createSignalSunGeometry() {
  const core = new SphereGeometry(5.8, 48, 32);
  const parts: BufferGeometry[] = [core];
  const up = new Vector3(0, 1, 0);
  const rotation = new Quaternion();
  const direction = new Vector3();
  const addRay = (length: number, width: number) => {
    const ray = new ConeGeometry(width, length, 5, 1);
    rotation.setFromUnitVectors(up, direction);
    ray.applyQuaternion(rotation);
    const distance = 5.45 + length / 2;
    ray.translate(
      direction.x * distance,
      direction.y * distance,
      direction.z * distance,
    );
    parts.push(ray);
  };
  // The long radial silhouette is legible from the approach; additional needles
  // over the sphere keep the object volumetric when exploring from other angles.
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI * 2) / 72;
    direction
      .set(Math.cos(angle), Math.sin(angle), 0)
      .applyAxisAngle(new Vector3(1, 0, 0), 0.65);
    addRay(7.5 + Math.sin(i * 2.4) * 0.35, 0.23);
  }
  for (let i = 0; i < 96; i++) {
    const y = 1 - (2 * (i + 0.5)) / 96;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * 2.399963229728653;
    direction.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    addRay(3.4 + (i % 5) * 0.45, 0.16);
  }
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  geometry.computeBoundingSphere();
  geometry.boundingSphere!.radius += 0.4; // Shader-driven corona displacement.
  return geometry;
}
