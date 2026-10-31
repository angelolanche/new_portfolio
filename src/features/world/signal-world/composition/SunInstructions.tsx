import type { RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { FloatingInstructionBlock } from '../media/FloatingInstructionBlock';
import { signalSunPosition } from '../signalLayout';
import {
  sunInstructionBlocks,
  sunInstructionPitch,
  sunInstructionScale,
  sunInstructionY,
} from './sunInstructionLayout';

export function SunInstructions({ clockRef }: { clockRef: RefObject<number> }) {
  const aspect = useThree(({ size }) => size.width / size.height);
  if (window.matchMedia?.('(pointer: coarse) and (max-width: 900px)').matches)
    return null;
  return (
    <group position={signalSunPosition} rotation={[sunInstructionPitch, 0, 0]}>
      <group
        position={[0, sunInstructionY, 0]}
        scale={sunInstructionScale(aspect)}
      >
        {sunInstructionBlocks.map((block, i) => (
          <FloatingInstructionBlock
            key={block.text}
            text={block.text}
            width={block.width}
            height={block.height}
            position={[block.x, block.y, 0]}
            seed={i < 5 ? 241 : 246}
            clockRef={clockRef}
          />
        ))}
      </group>
    </group>
  );
}
