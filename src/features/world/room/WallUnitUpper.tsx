import { FinishedBox as Box } from '../surfaces/FinishedBox';
import { DoubleSide } from 'three';
import { ShelfKeepsakes } from './details/ShelfKeepsakes';
import { wallUnitUpperPanels } from './sceneLayout';

function PorcelainVase({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]} scale={[0.1, 0.12, 0.1]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#d9d5bf" roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.055, 0.04, 0.13, 12]} />
        <meshStandardMaterial color="#d9d5bf" roughness={0.24} />
      </mesh>
      {[0.07, 0.3].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[y > 0.2 ? 0.055 : 0.088, 0.007, 5, 16]} />
          <meshStandardMaterial color="#677b8c" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
export function WallUnitUpper() {
  return (
    <group>
      {wallUnitUpperPanels.map((panel, i) => (
        <Box key={i} {...panel} color={i === 0 ? '#3b2b20' : '#63422d'} />
      ))}
      {[-1.6, 1.6].flatMap((x) =>
        [1.48, 2.04, 2.58].map((y) => (
          <Box
            key={`${x}-${y}`}
            position={[x, y, 0]}
            size={[1.16, 0.09, 0.85]}
            color="#735039"
          />
        )),
      )}
      <ShelfKeepsakes />
      <PorcelainVase position={[-1.92, 1.525, 0.06]} />
      <PorcelainVase position={[1.94, 1.525, 0.06]} scale={0.9} />
      <PorcelainVase position={[-1.6, 2.625, 0.05]} scale={0.85} />
      <PorcelainVase position={[0, 2.525, 0.05]} scale={1.1} />
      {/* A small porcelain teapot and cup occupy another family-display niche. */}
      <group position={[-1.42, 2.085, 0.08]}>
        <mesh position={[0, 0.11, 0]} scale={[0.13, 0.1, 0.12]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#d9d0b9" roughness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.16, 0]} rotation={[0, 0, -0.8]}>
          <coneGeometry args={[0.045, 0.16, 10]} />
          <meshStandardMaterial color="#d9d0b9" roughness={0.25} />
        </mesh>
        <mesh position={[-0.14, 0.12, 0]}>
          <torusGeometry args={[0.065, 0.014, 6, 16]} />
          <meshStandardMaterial color="#d9d0b9" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.035, 12]} />
          <meshStandardMaterial color="#9a9276" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.255, 0]}>
          <sphereGeometry args={[0.023, 8, 6]} />
          <meshStandardMaterial color="#d9d0b9" roughness={0.25} />
        </mesh>
      </group>
      {[-1.82, 1.34].map((x, i) => (
        <group key={x} position={[x, i ? 1.525 : 2.085, 0.18]}>
          <mesh position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.06, 0.04, 0.09, 12, 1, true]} />
            <meshStandardMaterial
              color="#d9d5bf"
              roughness={0.25}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[0.065, 0.045, 0]}>
            <torusGeometry args={[0.025, 0.008, 5, 12]} />
            <meshStandardMaterial color="#d9d5bf" roughness={0.25} />
          </mesh>
        </group>
      ))}
      {[1.38, 1.9].map((x, i) => (
        <group key={x} position={[x, 2.265 + i * 0.54, -0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.025, 24]} />
            <meshStandardMaterial color="#d7d2b8" roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <torusGeometry args={[0.145, 0.009, 6, 24]} />
            <meshStandardMaterial color="#738291" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
