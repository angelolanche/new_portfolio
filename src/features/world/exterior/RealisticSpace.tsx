import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BackSide,
  Mesh,
  NoBlending,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  VideoTexture,
} from 'three';
import { openingDuration } from '../opening/timing';
import type { SignalNavigation } from '../signal-world/navigation/signalNavigation';
import { createExteriorPlayback } from './exteriorPlayback';
import { exteriorBackdrop } from './exteriorLayout';
import { takePreparedVideo } from '../opening/scenePreload';

export const exteriorFragmentShader = `
  uniform sampler2D image;
  uniform bool videoFrame;
  uniform bool bypassDither;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(image, vUv);
    // Image textures are decoded by their sRGB GPU format; video needs decoding here.
    if (videoFrame) color = sRGBTransferEOTF(color);
    // The opaque exterior writes zero alpha as a treatment mask, not transparency.
    // The final dither pass resolves that mask to opaque, full-resolution color.
    gl_FragColor = vec4(color.rgb, bypassDither ? 0.0 : 1.0);
    #include <colorspace_fragment>
  }
`;

export function RealisticSpace({
  elapsedRef,
  playing,
  navigationRef,
  colorDither,
  posterOnly = false,
  onReady,
}: {
  elapsedRef: RefObject<number>;
  playing: boolean;
  navigationRef: RefObject<SignalNavigation>;
  colorDither: boolean;
  posterOnly?: boolean;
  onReady?: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const displayReadyRef = useRef(false);
  const notifiedRef = useRef(false);
  const playbackRef = useRef<ReturnType<typeof createExteriorPlayback> | null>(
    null,
  );
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          image: { value: null },
          videoFrame: { value: false },
          bypassDither: { value: false },
        },
        vertexShader: `varying vec2 vUv; void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
        fragmentShader: exteriorFragmentShader,
        side: BackSide,
        blending: NoBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => {
    materialRef.current = material;
    return () => {
      materialRef.current = null;
      material.dispose();
    };
  }, [material]);
  useEffect(() => {
    const current = materialRef.current;
    if (current) current.uniforms.bypassDither.value = colorDither;
  }, [colorDither]);
  useEffect(() => {
    let active = true;
    displayReadyRef.current = false;
    notifiedRef.current = false;
    const reducedMotion = navigationRef.current.reducedMotion;
    const usePoster = reducedMotion || posterOnly;
    let allowPoster = usePoster;
    let posterReady = false;
    const video = takePreparedVideo('/media/exterior/black-hole.mp4');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    const showPoster = () => {
      material.uniforms.image.value = poster;
      material.uniforms.videoFrame.value = false;
      displayReadyRef.current = allowPoster && posterReady;
    };
    const poster = new TextureLoader().load(
      '/media/exterior/black-hole-poster.jpg',
      () => {
        posterReady = true;
        if (active && (usePoster || video.readyState < 2)) showPoster();
      },
    );
    poster.colorSpace = SRGBColorSpace;
    const showVideo = () => {
      if (!active || reducedMotion) return;
      material.uniforms.image.value = texture;
      material.uniforms.videoFrame.value = true;
      // A decoded frame may predate VideoTexture's frame callback subscription.
      // Force its first upload even before the opening starts.
      texture.needsUpdate = true;
      displayReadyRef.current = true;
    };
    const playback = createExteriorPlayback(video, usePoster, showPoster);
    playbackRef.current = playback;
    const fail = () => {
      if (!active) return;
      allowPoster = true;
      showPoster();
      playback.fail();
    };
    video.addEventListener('loadeddata', showVideo);
    if (video.readyState >= 2 && !usePoster) queueMicrotask(showVideo);
    video.addEventListener('error', fail);
    if (video.error) queueMicrotask(fail);
    return () => {
      active = false;
      playbackRef.current = null;
      video.removeEventListener('loadeddata', showVideo);
      video.removeEventListener('error', fail);
      playback.dispose();
      texture.dispose();
      poster.dispose();
    };
  }, [material, navigationRef, posterOnly]);
  useFrame(() => {
    const time = elapsedRef.current;
    if (meshRef.current) meshRef.current.visible = time < openingDuration;
    playbackRef.current?.update(
      time,
      playing && !navigationRef.current.detailOpen,
    );
  });
  return (
    <mesh
      ref={meshRef}
      name="photographic-exterior"
      position={exteriorBackdrop.position}
      material={material}
      renderOrder={1}
      onAfterRender={() => {
        if (displayReadyRef.current && !notifiedRef.current) {
          notifiedRef.current = true;
          onReady?.();
        }
      }}
    >
      <cylinderGeometry
        args={[
          exteriorBackdrop.radius,
          exteriorBackdrop.radius,
          exteriorBackdrop.height,
          64,
          1,
          true,
          exteriorBackdrop.start,
          exteriorBackdrop.arc,
        ]}
      />
    </mesh>
  );
}
