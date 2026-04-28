'use client';

import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types/family';
import { getPersonFullName } from '@/lib/utils';
import PersonAvatar from '@/components/ui/person-avatar';
import NamePlaque from '@/components/ui/name-plaque';
import { graphAvatarSize } from '@/lib/theme';

interface GraphNodeData {
  person: Person;
  isSelected?: boolean;
}

interface GraphNodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

export default function GraphNode({ data, selected = false }: GraphNodeProps) {
  const { person, isSelected: isSelectedFromData } = data;
  const isSelected = isSelectedFromData ?? selected;
  const fullName = getPersonFullName(person);

  return (
    <div className="relative flex flex-col items-center w-full">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400 !top-0" />
      <PersonAvatar
        person={person}
        size={graphAvatarSize}
        isSelected={isSelected}
      />
      <NamePlaque
        isSelected={isSelected}
        className="relative z-10 -mt-2 px-2 py-1 min-w-0 max-w-full"
      >
        <span
          className="block line-clamp-2 break-words text-xs font-bold leading-tight text-gray-900 dark:text-white"
          title={fullName}
        >
          {fullName}
        </span>
      </NamePlaque>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-400 !bottom-0"
      />
    </div>
  );
}
