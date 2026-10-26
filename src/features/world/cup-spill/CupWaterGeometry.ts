import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import {
  liquidBottom,
  liquidHeight,
  getCupInnerRadius,
} from './cupWaterVolume';

const radialSegmentCount = 40;
function createContainerTriangles() {
  const bottomY = liquidBottom;
  const topY = liquidBottom + liquidHeight;
  const createLiquidRing = (y: number) =>
    Array.from({ length: radialSegmentCount }, (_, vertexIndex) => {
      const angleAroundCup = (vertexIndex * Math.PI * 2) / radialSegmentCount;
      return new Vector3(
        Math.cos(angleAroundCup) * getCupInnerRadius(y),
        y,
        Math.sin(angleAroundCup) * getCupInnerRadius(y),
      );
    });
  const bottomRing = createLiquidRing(bottomY),
    topRing = createLiquidRing(topY);
  const containerTriangles: Vector3[][] = [];
  for (let vertexIndex = 0; vertexIndex < radialSegmentCount; vertexIndex++) {
    const nextVertexIndex = (vertexIndex + 1) % radialSegmentCount;
    containerTriangles.push(
      [bottomRing[vertexIndex], topRing[vertexIndex], topRing[nextVertexIndex]],
      [
        bottomRing[vertexIndex],
        topRing[nextVertexIndex],
        bottomRing[nextVertexIndex],
      ],
      [
        new Vector3(0, bottomY, 0),
        bottomRing[vertexIndex],
        bottomRing[nextVertexIndex],
      ],
      [new Vector3(0, topY, 0), topRing[nextVertexIndex], topRing[vertexIndex]],
    );
  }

  return containerTriangles;
}

// Clip the tapered liquid volume against its free-surface plane, then cap the cut.
// This keeps the water level under gravity while the surrounding glass rotates.
export class CupWaterGeometry extends BufferGeometry {
  private readonly containerTriangles = createContainerTriangles();
  private readonly positions = new Float32Array(12000);
  constructor() {
    super();
    this.setAttribute('position', new BufferAttribute(this.positions, 3));
    this.setDrawRange(0, 0);
  }
  update(waterSurfaceHeight: number, angle: number, slosh: number, spin = 0) {
    const surfaceNormal = new Vector3(
      Math.sin(angle + slosh),
      Math.cos(angle + slosh),
      0,
    );
    surfaceNormal.applyAxisAngle(new Vector3(0, 1, 0), spin);
    const surfaceIntersections: Vector3[] = [];
    let positionOffset = 0;
    const writeTriangle = (
      startVertex: Vector3,
      endVertex: Vector3,
      thirdVertex: Vector3,
    ) => {
      for (const vertex of [startVertex, endVertex, thirdVertex]) {
        this.positions[positionOffset++] = vertex.x;
        this.positions[positionOffset++] = vertex.y;
        this.positions[positionOffset++] = vertex.z;
      }
    };
    for (const triangle of this.containerTriangles) {
      const polygon: Vector3[] = [];
      for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
        const startVertex = triangle[vertexIndex],
          endVertex = triangle[(vertexIndex + 1) % 3];
        const startDistanceToSurface =
            surfaceNormal.dot(startVertex) - waterSurfaceHeight,
          endDistanceToSurface =
            surfaceNormal.dot(endVertex) - waterSurfaceHeight;
        if (startDistanceToSurface <= 0) polygon.push(startVertex);
        if (startDistanceToSurface <= 0 !== endDistanceToSurface <= 0) {
          const point = startVertex
            .clone()
            .lerp(
              endVertex,
              startDistanceToSurface /
                (startDistanceToSurface - endDistanceToSurface),
            );
          polygon.push(point);
          surfaceIntersections.push(point);
        }
      }
      for (let vertexIndex = 1; vertexIndex < polygon.length - 1; vertexIndex++)
        writeTriangle(
          polygon[0],
          polygon[vertexIndex],
          polygon[vertexIndex + 1],
        );
    }
    if (surfaceIntersections.length > 2) {
      const center = surfaceIntersections
        .reduce((sum, vertex) => sum.add(vertex), new Vector3())
        .divideScalar(surfaceIntersections.length);
      const tangent = new Vector3(
        surfaceNormal.y,
        -surfaceNormal.x,
        0,
      ).normalize();
      const bitangent = tangent.clone().cross(surfaceNormal);
      surfaceIntersections.sort(
        (startVertex, endVertex) =>
          Math.atan2(
            startVertex.clone().sub(center).dot(bitangent),
            startVertex.clone().sub(center).dot(tangent),
          ) -
          Math.atan2(
            endVertex.clone().sub(center).dot(bitangent),
            endVertex.clone().sub(center).dot(tangent),
          ),
      );
      for (
        let vertexIndex = 0;
        vertexIndex < surfaceIntersections.length;
        vertexIndex++
      )
        writeTriangle(
          center,
          surfaceIntersections[(vertexIndex + 1) % surfaceIntersections.length],
          surfaceIntersections[vertexIndex],
        );
    }
    // Unused vertices must not affect normal recomputation or bounding-volume culling.
    this.positions.fill(0, positionOffset);
    this.setDrawRange(0, positionOffset / 3);
    this.getAttribute('position').needsUpdate = true;
    this.computeVertexNormals();
    this.computeBoundingSphere();
  }
}
