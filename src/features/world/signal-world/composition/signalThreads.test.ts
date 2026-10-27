import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { projects } from '../../../../content/projects';
import {
  projectBlockDepth,
  signalSunPosition,
  signalSunClearanceRadius,
} from '../signalLayout';
import { createSignalThreads, cutThread } from './signalThreads';

it('cuts a crossing segment before and after a work, including when both ends are outside', () => {
  const p = projects[0];
  const center = new Vector3(...p.position);
  const pieces = cutThread([
    center.clone().add(new Vector3(-12, 0, 0)),
    center.clone().add(new Vector3(12, 0, 0)),
  ]);
  expect(pieces.length).toBeGreaterThanOrEqual(2);
  expect(pieces[0].at(-1)!.distanceTo(center)).toBeGreaterThan(3);
  expect(pieces.at(-1)![0].distanceTo(center)).toBeGreaterThan(3);
});

it('keeps all 27 rendered threads clear of every video and exposes the first lead before the title', () => {
  const geometry = createSignalThreads();
  try {
    const vertices = geometry.getAttribute('position');
    const vertex = new Vector3();
    let leadingVertices = 0;
    for (let i = 0; i < vertices.count; i++) {
      vertex.fromBufferAttribute(vertices, i);
      expect(
        vertex.distanceTo(new Vector3(...signalSunPosition)),
      ).toBeGreaterThan(signalSunClearanceRadius - 0.1);
      expect(Number.isFinite(vertex.x + vertex.y + vertex.z)).toBe(true);
      if (vertex.z > -8) leadingVertices++;
      for (const [index, p] of projects.entries()) {
        const radius =
          (Math.hypot(
            (5.5 * p.videos[0].width) / p.videos[0].height,
            5.5,
            projectBlockDepth(index) * 2,
          ) *
            p.scale) /
          2;
        if (
          vertex.distanceToSquared(new Vector3(...p.position)) <
          (radius + 1.3) ** 2
        )
          throw new Error(`Thread intrudes on ${p.title}`);
      }
    }
    expect(leadingVertices).toBeGreaterThan(0);
  } finally {
    geometry.dispose();
  }
});

it('ends the lead before the entire solar corona, with a visible gap', () => {
  const sun = new Vector3(...signalSunPosition);
  const pieces = cutThread([sun.clone().add(new Vector3(0, -40, 0)), sun]);
  expect(pieces).toHaveLength(1);
  expect(pieces[0].at(-1)!.distanceTo(sun)).toBeCloseTo(
    signalSunClearanceRadius,
    8,
  );
  expect(signalSunClearanceRadius).toBeGreaterThanOrEqual(26);
});
