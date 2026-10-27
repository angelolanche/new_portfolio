export function RoomLighting() {
  return (
    <>
      <directionalLight
        position={[-3, 4.5, 3]}
        color="#ffcf99"
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.1}
        shadow-camera-far={16}
        shadow-normalBias={0.025}
        shadow-bias={-0.0002}
        shadow-autoUpdate={false}
        shadow-needsUpdate
      />
      <directionalLight
        position={[3, 2.5, -3]}
        color="#a1cfdd"
        intensity={0.7}
      />
      <hemisphereLight args={['#a6c2cf', '#463022', 0.65]} />
      <ambientLight color="#9ba6ad" intensity={0.16} />
    </>
  );
}
