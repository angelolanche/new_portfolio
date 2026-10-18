import { Component, Suspense, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DoubleSide, PerspectiveCamera } from 'three';
import { openingDuration, sampleOpening } from './cameraPath';
import {
  roomBounds,
  entryDoorPosition,
  entryDoorScale,
  sideWindowPosition,
  sideWindowScale,
  wovenChairPosition,
  wovenChairYaw,
  armchairPosition,
  armchairYaw,
  sofaPosition,
  tablePosition,
  tableRadius,
  glassPosition,
  phonePosition,
  televisionPosition,
  wallUnitUpperPanels,
} from './sceneLayout';

type BoxProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};
function Box({ position, size, color }: BoxProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
function EntryDoor() {
  return (
    <group
      position={entryDoorPosition}
      scale={entryDoorScale}
      rotation={[0, Math.PI / 2, 0]}
    >
      <Box position={[0, 1.1, 0]} size={[0.9, 2.2, 0.06]} color="#6e5039" />
      {[-0.49, 0.49].map((x) => (
        <Box
          key={x}
          position={[x, 1.13, 0.06]}
          size={[0.07, 2.26, 0.1]}
          color="#8d6c49"
        />
      ))}
      <Box
        position={[0, 2.27, 0.06]}
        size={[1.05, 0.09, 0.1]}
        color="#8d6c49"
      />
      {[-0.21, 0.21].flatMap((x) =>
        [0.57, 1.6].map((y) => (
          <group key={`${x}-${y}`}>
            <Box
              position={[x, y, 0.038]}
              size={[0.34, 0.79, 0.025]}
              color="#896547"
            />
            <Box
              position={[x, y, 0.055]}
              size={[0.26, 0.69, 0.012]}
              color="#71513a"
            />
          </group>
        )),
      )}
      <Box
        position={[0, 0.025, 0.06]}
        size={[0.94, 0.05, 0.14]}
        color="#453a2c"
      />
      <mesh position={[0.32, 1.06, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.015, 12]} />
        <meshStandardMaterial
          color="#a48c59"
          metalness={0.55}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0.32, 1.06, 0.14]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial
          color="#a48c59"
          metalness={0.55}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}
function SideWindow() {
  return (
    <group
      position={sideWindowPosition}
      scale={sideWindowScale}
      rotation={[0, Math.PI / 2, 0]}
    >
      <Box position={[0, 0, 0]} size={[1.75, 1.9, 0.08]} color="#282f2d" />
      <mesh position={[0, 0, 0.047]}>
        <planeGeometry args={[1.57, 1.72]} />
        <meshStandardMaterial
          color="#1f3a42"
          emissive="#234552"
          emissiveIntensity={0.45}
        />
      </mesh>
      {[-0.84, 0, 0.84].map((x) => (
        <Box
          key={x}
          position={[x, 0, 0.08]}
          size={[0.055, 1.9, 0.06]}
          color="#8e8065"
        />
      ))}
      <Box position={[0, 0, 0.08]} size={[1.75, 0.045, 0.06]} color="#8e8065" />
      <Box
        position={[0, -0.98, 0.12]}
        size={[1.95, 0.09, 0.23]}
        color="#70553c"
      />
      <Box
        position={[0, 1.1, 0.18]}
        size={[2.3, 0.055, 0.055]}
        color="#6a4b32"
      />
      {/* Static folds and a scalloped valance suggest heavy patterned curtains. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 7 }, (_, i) => (
            <group key={i}>
              <Box
                position={[
                  side * (0.66 + i * 0.065),
                  -0.18,
                  0.17 + (i % 2) * 0.055,
                ]}
                size={[0.085, 2.35, 0.08]}
                color={i % 2 ? '#9a7657' : '#b79b73'}
              />
              {[-0.9, -0.45, 0, 0.45].map((y) => (
                <Box
                  key={y}
                  position={[
                    side * (0.66 + i * 0.065),
                    y,
                    0.225 + (i % 2) * 0.055,
                  ]}
                  size={[0.05, 0.07, 0.012]}
                  color="#726b50"
                />
              ))}
            </group>
          ))}
        </group>
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          position={[
            -1.04 + i * 0.148,
            0.88 - Math.sin((i / 14) * Math.PI) * 0.08,
            0.24,
          ]}
          size={[0.16, 0.32, 0.1]}
          color={i % 2 ? '#a8855f' : '#b79b73'}
        />
      ))}
    </group>
  );
}
function PottedPlant({
  position,
  scale = 1,
  potColor = '#8b6045',
}: {
  position: [number, number, number];
  scale?: number;
  potColor?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.17, 0.44, 16]} />
        <meshStandardMaterial color={potColor} />
      </mesh>
      <mesh position={[0, 0.445, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.015, 16]} />
        <meshStandardMaterial color="#302a21" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 7, 0]}>
          <mesh position={[0, 0.85 + (i % 3) * 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.018, 0.9 + (i % 3) * 0.2, 6]} />
            <meshStandardMaterial color="#536343" />
          </mesh>
          <mesh
            position={[0.19, 1.15 + (i % 3) * 0.12, 0]}
            rotation={[0, 0, -0.65]}
            scale={[0.14, 0.4, 0.055]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={i % 2 ? '#65764b' : '#435d43'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function WovenChair() {
  return (
    <group position={wovenChairPosition} rotation={[0, wovenChairYaw, 0]}>
      <Box position={[0, 0.45, 0]} size={[0.56, 0.06, 0.54]} color="#765035" />
      <Box
        position={[0, 0.487, 0]}
        size={[0.46, 0.014, 0.44]}
        color="#a88b5b"
      />
      {[-0.24, 0.24].flatMap((x) =>
        [-0.22, 0.22].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, 0.22, z]}
            size={[0.05, 0.44, 0.05]}
            color="#765035"
          />
        )),
      )}
      {[-0.25, 0.25].map((x) => (
        <Box
          key={x}
          position={[x, 0.85, 0.24]}
          size={[0.055, 0.8, 0.055]}
          color="#765035"
        />
      ))}
      {[0.68, 1.22].map((y) => (
        <Box
          key={y}
          position={[0, y, 0.24]}
          size={[0.55, 0.06, 0.06]}
          color="#765035"
        />
      ))}
      {/* Open gaps and alternating strand depth suggest woven cane at blockout scale. */}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i}>
          <Box
            position={[-0.2 + i * 0.05, 0.95, 0.24 + (i % 2) * 0.006]}
            size={[0.015, 0.49, 0.008]}
            color="#baa071"
          />
          <Box
            position={[0, 0.73 + i * 0.055, 0.244 - (i % 2) * 0.006]}
            size={[0.46, 0.013, 0.008]}
            color="#ab8d5c"
          />
        </group>
      ))}
      <Box
        position={[0, 0.2, 0.22]}
        size={[0.5, 0.035, 0.035]}
        color="#765035"
      />
    </group>
  );
}
function Armchair() {
  return (
    <group position={armchairPosition} rotation={[0, armchairYaw, 0]}>
      <Box position={[0, 0.36, 0]} size={[1.05, 0.4, 0.95]} color="#796a52" />
      <Box
        position={[0, 0.59, -0.05]}
        size={[0.76, 0.17, 0.74]}
        color="#99866a"
      />
      <Box
        position={[0, 0.9, 0.36]}
        size={[1.05, 0.85, 0.22]}
        color="#8b775c"
      />
      {[-0.48, 0.48].map((x) => (
        <mesh
          key={x}
          position={[x, 0.7, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.14, 0.66, 4, 12]} />
          <meshStandardMaterial color="#8b775c" roughness={0.9} />
        </mesh>
      ))}
      {[-0.37, 0.37].flatMap((x) =>
        [-0.3, 0.3].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, 0.12, z]}
            size={[0.09, 0.24, 0.09]}
            color="#3e2a1f"
          />
        )),
      )}
    </group>
  );
}
function CeilingFixture() {
  return (
    <group position={[0.1, 3.15, -0.3]}>
      <mesh>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
        <meshStandardMaterial color="#8c7045" metalness={0.6} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.36, 8]} />
        <meshStandardMaterial color="#8c7045" metalness={0.6} roughness={0.6} />
      </mesh>
      {/* Unlit brass arms and frosted glass cups; no light or emissive material. */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[0, -0.4, 0]}
          rotation={[0, (i * Math.PI * 2) / 3, 0]}
        >
          <mesh position={[0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
            <meshStandardMaterial
              color="#8c7045"
              metalness={0.6}
              roughness={0.6}
            />
          </mesh>
          <mesh position={[0.34, 0.07, 0]}>
            <cylinderGeometry args={[0.14, 0.07, 0.18, 16, 1, true]} />
            <meshStandardMaterial
              color="#b3ac95"
              roughness={0.65}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[0.34, 0.055, 0]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color="#c6bfa9" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
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
        <sphereGeometry args={[1, 12, 8]} />
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
function WallUnitUpper() {
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
function RoomDetails() {
  return (
    <group>
      <SideWindow />
      <EntryDoor />
      <Armchair />
      <WovenChair />
      <CeilingFixture />
      <PottedPlant position={[-2.25, 0, -1.25]} />
      <PottedPlant position={[3.5, 0, -1.6]} scale={1.05} potColor="#71634c" />
      <PottedPlant
        position={[-2.44, 0.87, -0.5]}
        scale={0.32}
        potColor="#a18a63"
      />
      <PottedPlant
        position={[2.69, 0.9, -2.85]}
        scale={0.3}
        potColor="#79644d"
      />
      {/* Layered rectangles suggest a woven border without adding texture assets. */}
      <Box
        position={[0.1, 0.025, -0.45]}
        size={[4.8, 0.035, 3.8]}
        color="#755341"
      />
      <Box
        position={[0.1, 0.047, -0.45]}
        size={[4.55, 0.008, 3.55]}
        color="#b19a70"
      />
      <Box
        position={[0.1, 0.054, -0.45]}
        size={[4.35, 0.008, 3.35]}
        color="#604d48"
      />
      {[-1.35, -0.6, 0.15, 0.9, 1.65].map((x) => (
        <mesh
          key={x}
          position={[x, 0.061, -0.45]}
          rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        >
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial color="#9b8967" />
        </mesh>
      ))}
      {/* Picture frames and simple abstract inserts, rather than invented family photos. */}
      {[
        [-1.7, 2.15, 0.65, 0.8],
        [0.1, 2.45, 1, 0.55],
        [1.65, 2.05, 0.65, 0.85],
      ].map(([x, y, width, height]) => (
        <group key={x}>
          <Box
            position={[x, y, -3.47]}
            size={[width, height, 0.07]}
            color="#392b22"
          />
          <Box
            position={[x, y, -3.42]}
            size={[width - 0.09, height - 0.09, 0.025]}
            color="#ad9b7c"
          />
          <Box
            position={[x, y, -3.4]}
            size={[width * 0.55, height * 0.48, 0.015]}
            color="#576052"
          />
        </group>
      ))}
      <group position={[-2.3, 0, -2.1]}>
        <Box position={[0, 0.7, 0]} size={[0.65, 0.07, 0.6]} color="#75503a" />
        <Box
          position={[0, 0.36, 0]}
          size={[0.12, 0.65, 0.12]}
          color="#493428"
        />
        <mesh position={[0, 0.79, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.1, 20]} />
          <meshStandardMaterial color="#9c7546" />
        </mesh>
        <mesh position={[0, 1.04, 0]}>
          <cylinderGeometry args={[0.045, 0.07, 0.48, 16]} />
          <meshStandardMaterial color="#a37c4f" />
        </mesh>
        <mesh position={[0, 1.39, 0]} castShadow>
          <cylinderGeometry args={[0.23, 0.36, 0.42, 24, 1, true]} />
          <meshStandardMaterial
            color="#d2ad76"
            emissive="#c88b40"
            emissiveIntensity={0.45}
            side={DoubleSide}
          />
        </mesh>
        <pointLight
          position={[0, 1.25, 0.15]}
          color="#ffc17a"
          intensity={9}
          distance={5}
        />
      </group>
    </group>
  );
}
function Room() {
  const width = roomBounds.right - roomBounds.left;
  const depth = roomBounds.front - roomBounds.back;
  const centerX = (roomBounds.left + roomBounds.right) / 2;
  const centerZ = (roomBounds.back + roomBounds.front) / 2;
  return (
    <group>
      <Box
        position={[centerX, -0.1, centerZ]}
        size={[width, 0.2, depth]}
        color="#493329"
      />
      <Box
        position={[centerX, roomBounds.height / 2, roomBounds.back]}
        size={[width, roomBounds.height, 0.15]}
        color="#48473d"
      />
      <Box
        position={[roomBounds.left, roomBounds.height / 2, centerZ]}
        size={[0.15, roomBounds.height, depth]}
        color="#51453a"
      />
      <Box
        position={[roomBounds.right, roomBounds.height / 2, centerZ]}
        size={[0.15, roomBounds.height, depth]}
        color="#51453a"
      />
      <Box
        position={[roomBounds.right - 0.11, 0.12, centerZ]}
        size={[0.12, 0.24, depth]}
        color="#2b211c"
      />
      <Box
        position={[centerX, 0.12, roomBounds.back + 0.12]}
        size={[width, 0.24, 0.12]}
        color="#2b211c"
      />
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          position={[-2.45 + i * 0.45, 0.003, 0.7]}
          size={[0.012, 0.008, 8.6]}
          color="#2c241e"
        />
      ))}
      <Box
        position={[-0.65, 0.014, 0.5]}
        size={[4.2, 0.025, 3.1]}
        color="#383c37"
      />
      <RoomDetails />
      {/* The back faces the camera; only the child's lower legs emerge beside it. */}
      <group position={sofaPosition}>
        <Box position={[0, 0.39, 0]} size={[2.8, 0.5, 1.05]} color="#77705a" />
        <Box
          position={[0, 0.92, 0.43]}
          size={[2.8, 0.96, 0.32]}
          color="#8b8168"
        />
        {[-1.35, 1.35].map((x) => (
          <mesh
            key={x}
            position={[x, 0.73, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.22, 0.85, 4, 12]} />
            <meshStandardMaterial color="#82755e" />
          </mesh>
        ))}
        {[-0.7, 0, 0.7].map((x) => (
          <Box
            key={x}
            position={[x, 0.69, -0.06]}
            size={[0.67, 0.17, 0.75]}
            color="#92866c"
          />
        ))}
        {[-1, 1].map((x) => (
          <Box
            key={x}
            position={[x, 0.12, 0]}
            size={[0.12, 0.24, 0.7]}
            color="#291d19"
          />
        ))}
        <group position={[1.22, 0, -0.6]}>
          {[0, 0.22].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <Box
                position={[0, 0.5, -0.12]}
                size={[0.13, 0.32, 0.14]}
                color="#8c6954"
              />
              <Box
                position={[0, 0.32, -0.16]}
                size={[0.13, 0.15, 0.15]}
                color="#d3cebb"
              />
              <Box
                position={[0, 0.25, -0.24]}
                size={[0.14, 0.12, 0.28]}
                color="#d3cebb"
              />
            </group>
          ))}
        </group>
      </group>
      <group position={televisionPosition}>
        <WallUnitUpper />
        <Box position={[0, 0.82, 0]} size={[4.7, 0.16, 0.92]} color="#63422d" />
        <Box position={[0, 0.12, 0]} size={[4.6, 0.12, 0.85]} color="#453023" />
        <Box
          position={[0, 0.47, -0.38]}
          size={[4.6, 0.7, 0.07]}
          color="#30251d"
        />
        {[-2.25, -1.1, 0.7, 2.25].map((x) => (
          <Box
            key={x}
            position={[x, 0.47, 0]}
            size={[0.12, 0.7, 0.85]}
            color="#63422d"
          />
        ))}
        {/* Raised panel doors and brass handles give the cabinet more visual weight. */}
        {[-1.68, 1.5].map((x) => (
          <group key={x}>
            <Box
              position={[x, 0.46, 0.44]}
              size={[1.02, 0.57, 0.08]}
              color="#73503a"
            />
            <Box
              position={[x, 0.46, 0.49]}
              size={[0.83, 0.39, 0.035]}
              color="#5c3e2c"
            />
            <Box
              position={[x + 0.34, 0.49, 0.53]}
              size={[0.035, 0.13, 0.045]}
              color="#b99b60"
            />
          </group>
        ))}
        <Box
          position={[-0.2, 0.43, 0]}
          size={[1.7, 0.07, 0.8]}
          color="#63422d"
        />
        <Box
          position={[0, 0.18, 0.47]}
          size={[4.6, 0.15, 0.09]}
          color="#533725"
        />
        <group position={[0, 0.28, 0]}>
          {/* VHS deck with cassette slot, display and buttons. */}
          <Box
            position={[-0.15, 0.05, 0.03]}
            size={[0.8, 0.15, 0.5]}
            color="#72746b"
          />
          <Box
            position={[-0.29, 0.07, 0.288]}
            size={[0.34, 0.025, 0.015]}
            color="#171e1b"
          />
          <Box
            position={[0.09, 0.07, 0.29]}
            size={[0.16, 0.035, 0.02]}
            color="#67948a"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <Box
              key={i}
              position={[-0.95 + i * 0.1, 0.29, 0.18]}
              size={[0.065, 0.28 + (i % 3) * 0.02, 0.3]}
              color={['#706b4a', '#8e7155', '#4a5d56'][i % 3]}
            />
          ))}
          <Box
            position={[0, 1.04, 0]}
            size={[1.25, 0.91, 0.72]}
            color="#242b29"
          />
          <group position={[0, 1.5, -0.05]}>
            <mesh>
              <sphereGeometry args={[0.085, 12, 8]} />
              <meshStandardMaterial color="#333b36" />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side} rotation={[0, 0, side * 0.55]}>
                <mesh position={[0, 0.3, 0]}>
                  <cylinderGeometry args={[0.007, 0.012, 0.6, 8]} />
                  <meshStandardMaterial
                    color="#b3b8aa"
                    metalness={0.7}
                    roughness={0.35}
                  />
                </mesh>
              </group>
            ))}
          </group>
          <mesh position={[-0.1, 1.06, 0.372]}>
            <boxGeometry args={[0.94, 0.67, 0.035]} />
            <meshBasicMaterial color="#81a5a0" />
          </mesh>
          {Array.from({ length: 25 }, (_, i) => (
            <mesh key={i} position={[-0.1, 0.75 + i * 0.025, 0.394]}>
              <planeGeometry args={[0.9, 0.007]} />
              <meshBasicMaterial color={i % 3 === 0 ? '#b2cbc4' : '#527579'} />
            </mesh>
          ))}
          <pointLight
            position={[0, 1.2, 0.8]}
            color="#99e1e6"
            intensity={8}
            distance={5}
          />
        </group>
      </group>
      <group position={tablePosition}>
        <mesh position={[0, 0.79, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tableRadius, tableRadius, 0.1, 48]} />
          <meshStandardMaterial color="#725039" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.39, 0]} castShadow>
          <cylinderGeometry args={[0.095, 0.16, 0.74, 12]} />
          <meshStandardMaterial color="#493020" />
        </mesh>
        <Box position={[0, 0.07, 0]} size={[1.1, 0.1, 0.15]} color="#493020" />
        <Box position={[0, 0.07, 0]} size={[0.15, 0.1, 1.1]} color="#493020" />
        <group position={phonePosition} rotation={[0, -0.2, 0]}>
          <Box
            position={[0, 0.065, 0]}
            size={[0.48, 0.13, 0.36]}
            color="#474b3b"
          />
          <Box
            position={[0, 0.15, -0.08]}
            size={[0.38, 0.12, 0.14]}
            color="#3b4034"
          />
          <mesh position={[0, 0.137, 0.055]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.015, 24]} />
            <meshStandardMaterial color="#b2a888" />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 10;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.08,
                  0.149,
                  0.055 + Math.sin(angle) * 0.08,
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[0.014, 10]} />
                <meshStandardMaterial color="#35392f" />
              </mesh>
            );
          })}
          <Box
            position={[0, 0.25, -0.08]}
            size={[0.47, 0.08, 0.1]}
            color="#252d26"
          />
          {[-0.23, 0.23].map((x) => (
            <Box
              key={x}
              position={[x, 0.215, -0.055]}
              size={[0.12, 0.12, 0.17]}
              color="#252d26"
            />
          ))}
        </group>
        <group position={[-0.4, 0.84, -0.18]} rotation={[0, -0.12, 0]}>
          <Box
            position={[0, 0.012, 0]}
            size={[0.34, 0.024, 0.42]}
            color="#665640"
          />
          <Box
            position={[0, 0.032, 0.008]}
            size={[0.32, 0.022, 0.39]}
            color="#d6c9a3"
          />
          {[-0.11, -0.055, 0, 0.055, 0.11].map((x) => (
            <mesh
              key={x}
              position={[x, 0.047, -0.19]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <torusGeometry args={[0.014, 0.003, 5, 10]} />
              <meshStandardMaterial
                color="#6c7066"
                metalness={0.5}
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
        <group
          position={[-0.17, 0.858, -0.18]}
          rotation={[Math.PI / 2, 0, -0.14]}
        >
          <mesh>
            <cylinderGeometry args={[0.009, 0.009, 0.26, 8]} />
            <meshStandardMaterial color="#394954" />
          </mesh>
          <mesh position={[0, -0.145, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.009, 0.03, 8]} />
            <meshStandardMaterial color="#b5af98" />
          </mesh>
        </group>
        <group position={[0.3, 0.84, -0.55]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.06, 20]} />
            <meshStandardMaterial color="#765132" />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.035, 0.06, 0.43, 12]} />
            <meshStandardMaterial color="#ae8b57" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.53, 0]}>
            <cylinderGeometry args={[0.15, 0.24, 0.29, 20, 1, true]} />
            <meshStandardMaterial
              color="#d3b583"
              emissive="#d99948"
              emissiveIntensity={0.65}
              side={DoubleSide}
            />
          </mesh>
          <pointLight
            position={[0, 0.43, 0.04]}
            color="#ffd092"
            intensity={5}
            distance={2.5}
          />
        </group>
        <group position={glassPosition}>
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.106, 0.085, 0.42, 32, 1, true]} />
            <meshStandardMaterial
              color="#c7e0d7"
              transparent
              opacity={0.22}
              roughness={0.16}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.094, 0.079, 0.23, 32]} />
            <meshStandardMaterial
              color="#6faaa9"
              transparent
              opacity={0.5}
              roughness={0.2}
            />
          </mesh>
          {[0.01, 0.42].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[y ? 0.106 : 0.085, 0.006, 8, 32]} />
              <meshStandardMaterial color="#d2e7da" roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>
      <pointLight
        position={[-2.5, 2.7, 1]}
        color="#ffbd79"
        intensity={26}
        distance={10}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <ambientLight color="#9ba6ad" intensity={0.35} />
    </group>
  );
}
function CameraMove({ playing, reset }: { playing: boolean; reset: number }) {
  const elapsed = useRef(0);
  const lastReset = useRef(reset);
  useFrame(({ camera, size }, delta) => {
    if (lastReset.current !== reset) {
      elapsed.current = 0;
      lastReset.current = reset;
    }
    if (playing)
      elapsed.current = Math.min(
        openingDuration,
        elapsed.current + Math.min(delta, 0.1),
      );
    const pose = sampleOpening(elapsed.current, size.width / size.height);
    if (camera instanceof PerspectiveCamera && camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
  });
  return null;
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="fallback" role="status">
        The 3D study could not load. This portfolio is in development.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function Opening() {
  const [playing, setPlaying] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const [reset, setReset] = useState(0);
  return (
    <section className="opening" aria-label="Between Frames opening blockout">
      <SceneBoundary>
        <Suspense fallback={<p className="fallback">Loading room…</p>}>
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ fov: 42, near: 0.03, far: 40 }}
            fallback={
              <p className="fallback">
                WebGL is unavailable. This portfolio is in development.
              </p>
            }
          >
            <color attach="background" args={['#171c1c']} />
            <Room />
            <CameraMove playing={playing} reset={reset} />
          </Canvas>
        </Suspense>
      </SceneBoundary>
      <div className="study-caption">
        <span>01 / Before the fall</span>
        <p>
          A room. A television.
          <br />
          An ordinary moment.
        </p>
      </div>
      <div className="controls">
        <button onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            setReset(reset + 1);
            setPlaying(true);
          }}
        >
          Replay
        </button>
      </div>
    </section>
  );
}
