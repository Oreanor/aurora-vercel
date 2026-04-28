'use client';

import { useEffect, useRef } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

interface FlowContentProps {
  nodes: Node[];
  onFitted: () => void;
}

export default function FlowContent({ nodes, onFitted }: FlowContentProps) {
  const { fitView } = useReactFlow();
  const onFittedRef = useRef(onFitted);

  useEffect(() => {
    onFittedRef.current = onFitted;
  }, [onFitted]);

  useEffect(() => {
    if (nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        fitView({ padding: 0.2, maxZoom: 1.5 });
        onFittedRef.current();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [fitView, nodes]);

  return null;
}
