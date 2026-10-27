import { expect, it } from 'vitest';
import { Euler, Group, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { projects } from '../../../../content/projects';
import { createPlaqueLayout } from './plaqueLayout';
import { choosePlaquePlacement, rectanglesOverlap } from './plaquePlacement';
import {
  advanceSignal,
  signalCameraOffset,
  signalTravelDuration,
  type SignalNavigation,
} from '../navigation/signalNavigation';
import { sampleFloat, videoFloatAmplitude } from '../signalFloat';
import { sampleOpening, openingDuration } from '../../opening/cameraPath';
import { wrapPlaqueText } from './plaqueText';
import {
  signalTitleScale,
  titleWidth,
  titleHeight,
  titleHorizontalPadding,
} from '../media/signalTitleLayout';

function createPlaques() {
  return projects.map((project, index) => {
    const plaque = new Group();
    plaque.userData = {
      width: 3.5 + (index % 3) * 0.5,
      height: 1.2 + (index % 4) * 0.2,
      project: project.slug,
    };
    return plaque;
  });
}
function navigationAt(index: number): SignalNavigation {
  return {
    mode: 'scroll',
    progress: projects[index].progress,
    target: projects[index].progress,
    reducedMotion: false,
    detailOpen: false,
  };
}
function frameProject(
  camera: PerspectiveCamera,
  index: number,
  seconds: number,
) {
  const translation = new Vector3();
  sampleFloat(seconds, index, videoFloatAmplitude, translation, new Vector3());
  camera.position
    .copy(signalCameraOffset(projects[index].progress, new Vector3()))
    .add(new Vector3(0, 0, -1.5));
  camera.lookAt(new Vector3(...projects[index].position).add(translation));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
function transform(plaque: Group) {
  return [
    ...plaque.position.toArray(),
    ...plaque.quaternion.toArray(),
    ...plaque.scale.toArray(),
  ];
}
function localTransform(plaque: Group, index: number, seconds: number) {
  const project = projects[index];
  const translation = new Vector3(),
    rotation = new Vector3();
  sampleFloat(seconds, index, videoFloatAmplitude, translation, rotation);
  const inverse = new Quaternion()
    .setFromEuler(
      new Euler(
        project.rotation[0] + rotation.x,
        project.rotation[1] + rotation.y,
        project.rotation[2] + rotation.z,
      ),
    )
    .invert();
  const position = plaque.position
    .clone()
    .sub(new Vector3(...project.position))
    .sub(translation)
    .applyQuaternion(inverse)
    .divideScalar(project.scale);
  const orientation = inverse.multiply(plaque.quaternion);
  return [
    ...position.toArray(),
    ...orientation.toArray(),
    plaque.scale.x / project.scale,
  ];
}
function assertInFrame(plaque: Group, camera: PerspectiveCamera) {
  expect(plaque.visible).toBe(true);
  plaque.updateMatrixWorld();
  for (const x of [-plaque.userData.width / 2, plaque.userData.width / 2])
    for (const y of [-plaque.userData.height / 2, plaque.userData.height / 2])
      for (const z of [0.002, -0.2]) {
        const point = new Vector3(x, y, z)
          .applyMatrix4(plaque.matrixWorld)
          .project(camera);
        expect(Math.abs(point.x), plaque.userData.project).toBeLessThan(0.97);
        expect(Math.abs(point.y), plaque.userData.project).toBeLessThan(0.97);
        expect(point.z).toBeGreaterThan(-1);
        expect(point.z).toBeLessThan(1);
      }
}

it.each([0.4, 9 / 16, 1, 16 / 9, 21 / 9])(
  'fits below or beside every film only on arrival at aspect %s',
  (aspect) => {
    const camera = new PerspectiveCamera(
      sampleOpening(openingDuration, aspect).fov + Math.max(0, 1 - aspect) * 35,
      aspect,
      0.03,
      400,
    );
    for (const seconds of [0, 8, 23]) {
      const plaques = createPlaques();
      const layout = createPlaqueLayout();
      projects.forEach((_, index) => {
        frameProject(camera, index, seconds);
        layout(plaques, camera, seconds, true, navigationAt(index));
        expect(['below', 'right', 'left']).toContain(
          plaques[index].userData.placement,
        );
        assertInFrame(plaques[index], camera);
      });
    }
  },
);

it('waits for the actual scroll arrival and changes only the destination, including reduced motion and Locate', () => {
  const camera = new PerspectiveCamera(50, 16 / 9, 0.03, 400);
  const plaques = createPlaques();
  const layout = createPlaqueLayout();
  const seconds = 5;
  const navigation = navigationAt(0);
  frameProject(camera, 0, seconds);
  layout(plaques, camera, seconds, true, { ...navigation, mode: 'free' });
  const defaults = plaques.map(transform);
  navigation.progress -= 0.001;
  navigation.travel = {
    from: 0,
    to: navigation.target,
    elapsed: signalTravelDuration - 0.001,
  };
  layout(plaques, camera, seconds, true, navigation);
  expect(plaques.map(transform)).toEqual(defaults);
  advanceSignal(navigation, 0.01);
  layout(plaques, camera, seconds, true, navigation);
  expect(transform(plaques[0])).not.toEqual(defaults[0]);
  plaques
    .slice(1)
    .forEach((plaque, index) =>
      expect(transform(plaque)).toEqual(defaults[index + 1]),
    );
  const firstArrival = transform(plaques[0]);
  navigation.target = projects[1].progress;
  navigation.reducedMotion = true;
  frameProject(camera, 1, seconds);
  layout(plaques, camera, seconds, true, navigation);
  expect(transform(plaques[1])).toEqual(defaults[1]);
  advanceSignal(navigation, 0.01);
  layout(plaques, camera, seconds, true, navigation);
  expect(transform(plaques[1])).not.toEqual(defaults[1]);
  expect(transform(plaques[0])).toEqual(firstArrival);
  plaques
    .slice(2)
    .forEach((plaque, index) =>
      expect(transform(plaque)).toEqual(defaults[index + 2]),
    );
});

it('never recomputes positions, orientation or scale from camera changes or switching between scroll and free', () => {
  const camera = new PerspectiveCamera(50, 16 / 9, 0.03, 400);
  const plaques = createPlaques();
  const layout = createPlaqueLayout();
  const navigation = navigationAt(0);
  const seconds = 8;
  frameProject(camera, 0, seconds);
  layout(plaques, camera, seconds, true, navigation);
  const arrival = plaques.map(transform);
  const side = plaques[0].userData.placement;
  for (const mode of ['scroll', 'free', 'scroll', 'free'] as const) {
    navigation.mode = mode;
    for (const yaw of [-2.09, -0.5, 0, 0.5, 2.09]) {
      camera.position.add(new Vector3(33, -10, 18));
      camera.rotation.set(0.5, yaw, 0);
      camera.aspect = camera.aspect === 1 ? 9 / 16 : 1;
      camera.fov = 70;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      layout(plaques, camera, seconds, true, navigation);
      expect(plaques.map(transform)).toEqual(arrival);
      expect(plaques.every((plaque) => plaque.visible)).toBe(true);
      expect(plaques[0].userData.placement).toBe(side);
    }
  }
  const local = plaques.map((plaque, index) =>
    localTransform(plaque, index, seconds),
  );
  for (const later of [15, 30, 60]) {
    layout(plaques, camera, later, true, navigation);
    plaques.forEach((plaque, index) => {
      localTransform(plaque, index, later).forEach((value, component) =>
        expect(value).toBeCloseTo(local[index][component], 8),
      );
    });
  }
});

it('preserves saved placement through dialogs and revisits, and clears it only on Replay', () => {
  const camera = new PerspectiveCamera(50, 16 / 9, 0.03, 400);
  const plaques = createPlaques();
  const layout = createPlaqueLayout();
  const seconds = 8;
  const navigation = navigationAt(0);
  frameProject(camera, 0, seconds);
  layout(plaques, camera, seconds, true, { ...navigation, mode: 'free' });
  const defaults = plaques.map(transform);
  layout(plaques, camera, seconds, true, navigation);
  const arrival = plaques.map(transform);
  layout(plaques, camera, seconds, false, navigation);
  expect(plaques.every((plaque) => !plaque.visible)).toBe(true);
  camera.rotateY(1);
  camera.updateMatrixWorld();
  layout(plaques, camera, seconds, true, navigation);
  expect(plaques.map(transform)).toEqual(arrival);
  layout(plaques, camera, seconds, true, navigationAt(1));
  camera.aspect = 9 / 16;
  camera.fov = 69;
  frameProject(camera, 0, seconds);
  layout(plaques, camera, seconds, true, navigation);
  expect(transform(plaques[0])).not.toEqual(arrival[0]);
  assertInFrame(plaques[0], camera);
  layout(plaques, camera, seconds, true, { ...navigation, mode: 'free' }, 1);
  expect(plaques.map(transform)).toEqual(defaults);
  layout(plaques, camera, seconds, true, navigation, 1);
  assertInFrame(plaques[0], camera);
});

it('does not fit a stop reached in free mode or lose unvisited plaques at any camera distance', () => {
  const camera = new PerspectiveCamera(50, 16 / 9, 0.03, 400);
  const plaques = createPlaques();
  const layout = createPlaqueLayout();
  const navigation = { ...navigationAt(0), mode: 'free' as const };
  frameProject(camera, 0, 0);
  layout(plaques, camera, 0, true, navigation);
  const defaults = plaques.map(transform);
  camera.position.set(1000, -500, 800);
  camera.updateMatrixWorld();
  layout(plaques, camera, 0, true, navigation);
  expect(plaques.map(transform)).toEqual(defaults);
  expect(
    plaques.every(
      (plaque) => plaque.visible && plaque.userData.placement === 'below',
    ),
  ).toBe(true);
  plaques.forEach((plaque, index) => {
    const local = localTransform(plaque, index, 0);
    expect(local[0]).toBeCloseTo(0, 8);
    expect(local[1]).toBeCloseTo(
      -(5.5 + plaque.userData.height) / 2 - 0.35 / projects[index].scale,
      8,
    );
    expect(local[2]).toBeCloseTo(0, 8);
  });
});

it.each([0.4, 9 / 16, 1, 16 / 9, 21 / 9])(
  'keeps the expanded title block within frame at aspect %s',
  (aspect) => {
    const camera = new PerspectiveCamera(
      aspect < 1 ? 54 : 50,
      aspect,
      0.03,
      400,
    );
    camera.position.set(0, 0, -1.5);
    camera.updateMatrixWorld();
    const scale = signalTitleScale(aspect);
    for (const x of [
      -(titleWidth / 2 + titleHorizontalPadding),
      titleWidth / 2 + titleHorizontalPadding,
    ]) {
      for (const y of [-(titleHeight + 0.1) / 2, (titleHeight + 0.1) / 2]) {
        const corner = new Vector3(x * scale, 1.05 + y * scale, -8).project(
          camera,
        );
        expect(Math.abs(corner.x)).toBeLessThanOrEqual(0.9 + 1e-10);
        expect(Math.abs(corner.y)).toBeLessThan(0.95);
      }
    }
  },
);

it('moves a tall film label beside it when there is no room below', () => {
  const film = { left: -0.25, right: 0.25, bottom: -0.8, top: 0.8 };
  const placement = choosePlaquePlacement(film, 0.5, 0.25, [film]);
  expect(placement?.side).toBe('right');
  expect(rectanglesOverlap(placement!.rectangle, film)).toBe(false);
  expect(
    choosePlaquePlacement(film, 0.5, 0.25, [
      { left: -1, right: 1, bottom: -1, top: 1 },
    ]),
  ).toBeNull();
});

it('wraps long titles and categories within their text width without losing words', () => {
  const text = 'A Queimosa Subversao Tecnologica';
  const lines = wrapPlaqueText(text, (line) => line.length, 20);
  expect(lines.length).toBeGreaterThan(1);
  expect(lines.join(' ')).toBe(text);
  expect(lines.every((line) => line.length <= 20)).toBe(true);
});
