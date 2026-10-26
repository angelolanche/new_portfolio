import { FramedArtwork as Picture } from './FramedArtwork';
import { FinishedBox as Box } from './FinishedBox';
import { CanvasShoes } from './CanvasShoes';
import { televisionPosition } from './sceneLayout';
import { DrapedJacket } from './DrapedJacket';

export function LivedInDetails() {
  return (
    <group>
      <DrapedJacket />
      <CanvasShoes />
      {/* Existing toys grouped at the TV side of the rug, resting on its upper surface. */}
      <group position={[0.6, 0.058, -3.85]}>
        {[
          [-0.7, 2.25, 0.3],
          [-0.36, 2.48, -0.2],
          [-1.18, 2.54, 0.65],
        ].map(([x, z, a], i) => (
          <group key={x} position={[x, 0.065, z]} rotation={[0, a, 0]}>
            <Box
              position={[0, 0, 0]}
              size={[0.13, 0.13, 0.13]}
              color={['#a36a48', '#647e7b', '#b69a60'][i]}
              surface="wood"
            />
            {[0, Math.PI / 2, Math.PI].map((turn) => (
              <group key={turn} rotation={[0, turn, 0]}>
                <Box
                  position={[0, 0, 0.066]}
                  size={[0.104, 0.104, 0.004]}
                  color="#c8b68c"
                  surface="wood"
                  radius={0.006}
                />
                <mesh position={[0, 0, 0.069]} rotation={[0, 0, i * 0.25]}>
                  <ringGeometry
                    args={[0.022, 0.033, i === 0 ? 3 : i === 1 ? 4 : 24]}
                  />
                  <meshStandardMaterial
                    color={['#96503c', '#4e706f', '#927739'][i]}
                  />
                </mesh>
              </group>
            ))}
            <Box
              position={[0, 0.066, 0]}
              size={[0.095, 0.004, 0.095]}
              color="#c8b68c"
              surface="wood"
              radius={0.006}
            />
          </group>
        ))}
        <group position={[-0.1, 0, 2.13]} rotation={[0, -0.45, 0]}>
          <Box
            position={[0, 0.095, 0]}
            size={[0.25, 0.08, 0.13]}
            color="#9d4f3e"
            surface="plastic"
            radius={0.025}
          />
          <Box
            position={[0.02, 0.155, 0]}
            size={[0.11, 0.06, 0.11]}
            color="#b39869"
            surface="plastic"
          />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Box
                position={[0.02, 0.16, side * 0.058]}
                size={[0.087, 0.036, 0.005]}
                color="#364e55"
                surface="plastic"
                radius={0.006}
              />
              <Box
                position={[0.02, 0.16, side * 0.062]}
                size={[0.006, 0.039, 0.003]}
                color="#b39869"
                surface="plain"
              />
              <Box
                position={[side * 0.125, 0.075, 0]}
                size={[0.015, 0.022, 0.115]}
                color="#b3ada0"
                surface="plastic"
              />
              <Box
                position={[-0.128, 0.112, side * 0.038]}
                size={[0.008, 0.023, 0.025]}
                color="#d2c18b"
                surface="plastic"
                radius={0.005}
              />
              {[-0.08, 0.08].map((x) => (
                <mesh
                  key={x}
                  position={[x, 0.055, side * 0.09]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.021, 0.021, 0.004, 16]} />
                  <meshStandardMaterial
                    color="#a59c82"
                    metalness={0.5}
                    roughness={0.4}
                  />
                </mesh>
              ))}
            </group>
          ))}
          {[-0.08, 0.08].flatMap((x) =>
            [-0.075, 0.075].map((z) => (
              <mesh
                key={`${x}/${z}`}
                position={[x, 0.055, z]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.042, 0.042, 0.025, 12]} />
                <meshStandardMaterial color="#292c2c" />
              </mesh>
            )),
          )}
        </group>
      </group>
      <group position={[3.88, 2.05, -0.75]} rotation={[0, -Math.PI / 2, 0]}>
        <Picture />
      </group>
      <group
        position={[-2.58, 2.12, 0.63]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.8}
      >
        <Picture />
      </group>
      <group position={televisionPosition}>
        <group
          position={[-1.24, 1.72, 0.22]}
          rotation={[-0.1, -0.12, 0]}
          scale={0.5}
        >
          <Picture portrait />
        </group>
        <group
          position={[1.72, 2.29, 0.25]}
          rotation={[-0.08, 0.15, 0]}
          scale={0.52}
        >
          <Picture portrait />
        </group>
      </group>
    </group>
  );
}
