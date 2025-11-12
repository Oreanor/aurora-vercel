'use client';

import { Handle, Position } from '@xyflow/react';

interface SpouseRingNodeProps {
  data: {
    size?: number;
  };
}

export default function SpouseRingNode({ data }: SpouseRingNodeProps) {
  const size = data.size || 28;
  
  return (
    <div className="relative flex items-center justify-center pointer-events-none w-full h-full">
      <div
        className="rounded-full border-4 border-[#E1CD34] bg-transparent shadow-lg"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4)',
        }}
      />
    </div>
  );
}

