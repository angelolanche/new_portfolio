import type { RefObject } from 'react';
import { signalInstructions } from './signalInstructionTexture';
import { FloatingInstructionBlock } from './FloatingInstructionBlock';

export function SignalInstructions({
  clockRef,
}: {
  clockRef: RefObject<number>;
}) {
  return (
    <group>
      {signalInstructions.map((text, i) => (
        <FloatingInstructionBlock
          key={text}
          text={text}
          width={[3.3, 3.95, 3][i]}
          height={0.48}
          position={
            [
              [-1.475, -1.565, 0.002],
              [-0.075, -2.165, 0.002],
              [-1.375, -3.24, 0.002],
            ][i] as [number, number, number]
          }
          tilt={([4, -3, 3][i] * Math.PI) / 180}
          seed={220 + i}
          clockRef={clockRef}
        />
      ))}
    </group>
  );
}
