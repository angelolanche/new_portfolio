import {
  Euler,
  Quaternion,
  Vector3,
  type Group,
  type PerspectiveCamera,
} from 'three';
import { projects } from '../../../../content/projects';
import { projectBlockDepth } from '../signalLayout';
import { sampleFloat, videoFloatAmplitude } from '../signalFloat';
import { choosePlaquePlacement, type ScreenRectangle } from './plaquePlacement';
import {
  isSignalTravelling,
  type SignalNavigation,
} from '../navigation/signalNavigation';
import { isSignalFreeFlight } from '../navigation/signalLook';

type PlaqueAnchor = {
  offset: Vector3;
  orientation: Quaternion;
  scale: number;
  side: string;
};

/** Fit once on arrival, then attach the saved pose to the film in both modes. */
export function createPlaqueLayout() {
  const anchors = new WeakMap<Group, PlaqueAnchor>();
  let lastArrival: number | undefined;
  const center = new Vector3();
  const corner = new Vector3();
  const floatPosition = new Vector3();
  const floatRotation = new Vector3();
  const orientation = new Quaternion();
  const rotation = new Euler();
  const sampleVideo = (index: number, seconds: number) => {
    const project = projects[index];
    sampleFloat(
      seconds,
      index,
      videoFloatAmplitude,
      floatPosition,
      floatRotation,
    );
    center.fromArray(project.position).add(floatPosition);
    orientation.setFromEuler(
      rotation.set(
        project.rotation[0] + floatRotation.x,
        project.rotation[1] + floatRotation.y,
        project.rotation[2] + floatRotation.z,
      ),
    );
  };
  const applyAnchor = (plaque: Group, index: number, seconds: number) => {
    const project = projects[index];
    let anchor = anchors.get(plaque);
    if (!anchor) {
      anchor = {
        offset: new Vector3(
          0,
          -(5.5 + (plaque.userData.height as number)) / 2 -
            0.35 / project.scale,
          0,
        ),
        orientation: new Quaternion(),
        scale: 1,
        side: 'below',
      };
      anchors.set(plaque, anchor);
    }
    sampleVideo(index, seconds);
    plaque.position
      .copy(anchor.offset)
      .multiplyScalar(project.scale)
      .applyQuaternion(orientation)
      .add(center);
    plaque.quaternion.copy(orientation).multiply(anchor.orientation);
    plaque.scale.setScalar(project.scale * anchor.scale);
    plaque.userData.placement = anchor.side;
  };
  return (
    plaques: (Group | null)[],
    camera: PerspectiveCamera,
    seconds: number,
    enabled: boolean,
    navigation: SignalNavigation,
  ) => {
    const travelling = isSignalTravelling(navigation);
    if (travelling || navigation.target !== lastArrival)
      lastArrival = undefined;
    plaques.forEach((plaque, index) => {
      if (!plaque) return;
      plaque.visible = enabled;
      if (enabled) applyAnchor(plaque, index, seconds);
    });
    if (
      !enabled ||
      travelling ||
      navigation.mode === 'free' ||
      isSignalFreeFlight(navigation) ||
      lastArrival === navigation.target
    )
      return;
    const index = projects.findIndex(
      (project) => Math.abs(project.progress - navigation.target) < 0.00001,
    );
    const plaque = plaques[index];
    if (!plaque) return;
    // Only the destination is fitted. Other works keep their saved anchors.
    const films: { index: number; bounds: ScreenRectangle }[] = [];
    projects.forEach((project, filmIndex) => {
      sampleVideo(filmIndex, seconds);
      const depth = -corner.copy(center).applyMatrix4(camera.matrixWorldInverse)
        .z;
      if (depth <= camera.near || depth >= camera.far) return;
      const halfWidth =
        (5.5 * project.videos[0].width) / project.videos[0].height / 2;
      const bounds = {
        left: Infinity,
        right: -Infinity,
        bottom: Infinity,
        top: -Infinity,
      };
      for (const x of [-halfWidth, halfWidth])
        for (const y of [-2.75, 2.75])
          for (const z of [0, -projectBlockDepth(filmIndex)]) {
            corner
              .set(x, y, z)
              .multiplyScalar(project.scale)
              .applyQuaternion(orientation)
              .add(center)
              .project(camera);
            bounds.left = Math.min(bounds.left, corner.x);
            bounds.right = Math.max(bounds.right, corner.x);
            bounds.bottom = Math.min(bounds.bottom, corner.y);
            bounds.top = Math.max(bounds.top, corner.y);
          }
      if (
        bounds.right >= -1 &&
        bounds.left <= 1 &&
        bounds.top >= -1 &&
        bounds.bottom <= 1
      )
        films.push({ index: filmIndex, bounds });
    });
    lastArrival = navigation.target;
    const film = films.find((film) => film.index === index);
    if (!film) return;
    sampleVideo(index, seconds);
    const depth = -corner.copy(center).applyMatrix4(camera.matrixWorldInverse)
      .z;
    const clipDepth = corner.copy(center).project(camera).z;
    const verticalProjection = camera.projectionMatrix.elements[5] / depth;
    // Allow for the block thickness and its small fixed viewing angle.
    const projectedWidth =
      (((plaque.userData.width as number) * verticalProjection) /
        camera.aspect) *
      1.08;
    const projectedHeight =
      (plaque.userData.height as number) * verticalProjection * 1.08;
    const baseScale = Math.min(
      1,
      (camera.aspect < 1 ? 1.55 : 0.85) / projectedWidth,
      0.4 / projectedHeight,
    );
    const placement = choosePlaquePlacement(
      film.bounds,
      projectedWidth * baseScale,
      projectedHeight * baseScale,
      films.map((film) => film.bounds),
    );
    if (!placement) return;
    plaque.position.set(placement.x, placement.y, clipDepth).unproject(camera);
    plaque.quaternion.copy(camera.quaternion);
    plaque.rotateY(0.08);
    plaque.rotateX(-0.03);
    // Store the pose in video-local coordinates, never camera coordinates.
    const inverse = orientation.clone().invert();
    anchors.set(plaque, {
      offset: plaque.position
        .clone()
        .sub(center)
        .applyQuaternion(inverse)
        .divideScalar(projects[index].scale),
      orientation: inverse.multiply(plaque.quaternion),
      scale: (baseScale * placement.scale) / projects[index].scale,
      side: placement.side,
    });
    applyAnchor(plaque, index, seconds);
  };
}
