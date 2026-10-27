import { FinishedBox as Box } from '../surfaces/FinishedBox';

// Architecture stays in the room pass; the photographic exterior is independent.
export function WindowSpace() {
  return (
    <group>
      {/* Deep reveals connect the indoor frame to the exterior facade. */}
      {/* Layered timber trim, sash stops, brass catches and sill apron. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Slim glazing beads preserve the unobstructed space view. */}
          {[-0.79, -0.025, 0.025, 0.79].map((x) => (
            <Box
              key={x}
              position={[x, side * 0.445, 0.119]}
              size={[0.012, 0.84, 0.018]}
              color="#b09c7d"
              radius={0.002}
            />
          ))}
          {[-0.875, -0.03, 0.03, 0.875].map((y) => (
            <Box
              key={y}
              position={[side * 0.405, y, 0.119]}
              size={[0.75, 0.012, 0.018]}
              color="#b09c7d"
              radius={0.002}
            />
          ))}
          {[-0.61, 0.61].map((y) => (
            <group key={y} position={[side * 0.813, y, 0.15]}>
              <Box
                position={[0, 0, 0]}
                size={[0.055, 0.112, 0.012]}
                color="#635943"
                surface="plain"
                radius={0.004}
              />
              <mesh position={[side * 0.025, 0, 0.012]}>
                <cylinderGeometry args={[0.012, 0.012, 0.13, 12]} />
                <meshStandardMaterial
                  color="#9e8860"
                  metalness={0.7}
                  roughness={0.38}
                />
              </mesh>
              {[-0.036, 0.036].map((dy) => (
                <group key={dy} position={[-side * 0.012, dy, 0.008]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
                    <meshStandardMaterial
                      color="#ac9872"
                      metalness={0.65}
                      roughness={0.45}
                    />
                  </mesh>
                  <Box
                    position={[0, 0, 0.004]}
                    size={[0.007, 0.0015, 0.002]}
                    color="#342e23"
                    surface="plain"
                    radius={0}
                  />
                </group>
              ))}
            </group>
          ))}
          <Box
            position={[side * 0.89, -1.02, 0.15]}
            size={[0.13, 0.035, 0.25]}
            color="#9a8060"
          />
          <Box
            position={[side * 0.72, -1.09, 0.035]}
            size={[0.11, 0.16, 0.13]}
            color="#68513b"
            radius={0.025}
          />
        </group>
      ))}
      <Box
        position={[0, -0.995, 0.235]}
        size={[1.89, 0.023, 0.025]}
        color="#a18b6b"
        radius={0.006}
      />
      <Box
        position={[0, 0.012, 0.112]}
        size={[1.62, 0.012, 0.012]}
        color="#4e4639"
        radius={0.002}
      />
      {[-0.91, 0.91].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0, 0.075]}
            size={[0.1, 2.04, 0.12]}
            color="#756149"
          />
          <Box
            position={[x * 0.93, 0, 0.145]}
            size={[0.024, 1.85, 0.025]}
            color="#b09a78"
          />
        </group>
      ))}
      {[-0.94, 0.94].map((y) => (
        <group key={y}>
          <Box
            position={[0, y, 0.09]}
            size={[1.91, 0.095, 0.12]}
            color="#756149"
          />
          <Box
            position={[0, y * 0.94, 0.145]}
            size={[1.65, 0.022, 0.025]}
            color="#b09a78"
          />
        </group>
      ))}
      <Box
        position={[0, -1.07, 0.05]}
        size={[1.73, 0.12, 0.1]}
        color="#594432"
      />
      {[-0.11, 0.11].map((x) => (
        <group key={x}>
          <Box
            position={[x, -0.06, 0.13]}
            size={[0.045, 0.08, 0.02]}
            color="#8c7851"
            surface="plain"
          />
          <Box
            position={[x, -0.025, 0.155]}
            size={[0.075, 0.018, 0.028]}
            color="#ae9662"
            surface="plain"
          />
        </group>
      ))}
      {[-0.815, 0.815].map((x) => (
        <Box
          key={x}
          position={[x, 0, -0.22]}
          size={[0.06, 1.8, 0.58]}
          color="#82745e"
          surface="plaster"
          radius={0.005}
        />
      ))}
      <Box
        position={[0, -0.9, -0.23]}
        size={[1.8, 0.1, 0.8]}
        color="#8b806c"
        surface="plain"
        radius={0.015}
      />
      <Box
        position={[0, 0.9, -0.22]}
        size={[1.8, 0.08, 0.58]}
        color="#615c50"
        surface="plaster"
        radius={0.005}
      />
    </group>
  );
}
