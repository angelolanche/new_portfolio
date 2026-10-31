import type { RefObject } from 'react';
import {
  signalInstructions,
  touchSignalInstructions,
  signalInstructionLayout,
} from './signalInstructionTexture';
import { FloatingInstructionBlock } from './FloatingInstructionBlock';

export function SignalInstructions({
  clockRef,
}: {
  clockRef: RefObject<number>;
}) {
  const touchDevice = Boolean(
    window.matchMedia?.('(pointer: coarse) and (max-width: 900px)').matches,
  );
  const instructions = touchDevice
    ? touchSignalInstructions
    : signalInstructions;
  const layout = signalInstructionLayout(touchDevice);
  return (
    <group>
      {instructions.map((text, i) => (
        <FloatingInstructionBlock
          key={text}
          text={text}
          width={layout[i].width}
          height={layout[i].height}
          position={layout[i].position}
          tilt={layout[i].tilt}
          seed={220 + i}
          clockRef={clockRef}
        />
      ))}
    </group>
  );
}
