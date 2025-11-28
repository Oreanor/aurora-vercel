'use client';

import { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';
import { Person, Relationship } from '@/types/family';
import { getPersonRole, getPersonFullName } from '@/lib/utils';

interface FamilyNodeData {
  person: Person;
  isMainPerson?: boolean; // Main person (at bottom of tree)
  relationships?: Relationship[];
  mainPersonId?: string;
  persons?: Person[];
  isSelected?: boolean; // Whether node is selected
  showDescendants?: boolean; // If true, descendants mode (root at top, no trunk)
}

interface FamilyNodeProps {
  data: FamilyNodeData;
  isConnectable?: boolean;
}

export default function FamilyNode({ data, isConnectable = false }: FamilyNodeProps) {
  const { person, isMainPerson = false, relationships = [], mainPersonId = '', persons = [], isSelected = false, showDescendants = false } = data;

  const fullName = getPersonFullName(person);


  // Calculate person's role
  const role = useMemo(() => {
    if (!mainPersonId || relationships.length === 0 || persons.length === 0) {
      return '';
    }
    return getPersonRole(person.id, mainPersonId, relationships, persons);
  }, [person.id, mainPersonId, relationships, persons]);

  // Deterministic transformations for bushes based on person ID
  // This ensures same values on server and client
  const bushClasses = useMemo(() => {
    // Simple hash function to get pseudo-random value from ID
    let hash = 0;
    for (let i = 0; i < person.id.length; i++) {
      hash = ((hash << 5) - hash) + person.id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use hash for deterministic selection
    const rotateClass = Math.abs(hash) % 2 === 0 ? 'rotate-0' : 'rotate-180';
    const scaleOptions = ['scale-[1.25]', 'scale-[1.35]', 'scale-[1.45]'];
    const scaleIndex = Math.abs(hash) % scaleOptions.length;
    const scaleClass = scaleOptions[scaleIndex];
    
    return `${rotateClass} ${scaleClass}`;
  }, [person.id]);

  // Avatar background color
  const getAvatarColor = () => {
    if (isMainPerson) return 'bg-sky-600';
    if (person.gender === 'female') return 'bg-pink-400';
    return 'bg-blue-400';
  };

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;
  const deathYear = person.deathDate
    ? new Date(person.deathDate).getFullYear()
    : null;

  return (
    <div className={`relative flex flex-col items-center w-[200px] ${isMainPerson && !showDescendants ? 'h-[450px]' : 'h-[100px]'}`}>
      {/* Handle at top (for incoming connections) - at top of bush */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 top-[30px]"
      />


      <Image
        src="/tree/bush.svg"
        alt=""
        width={180}
        height={180}
        className="absolute top-0 left-1/2 -translate-x-1/2 scale-[1.45] w-auto h-auto z-[2]"
        unoptimized
      />

      {/* Avatar */}
      <div className={`avatar-container w-36 h-36 overflow-hidden rounded-[50%/50%] border-[#E1CD34] absolute z-10 left-1/2 -translate-x-1/2 -top-[40px] ${isSelected ? 'border-10' : 'border-4'}`}>
        {person.photo ? (
          <Image
            src={person.photo}
            alt={fullName}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className={`pt-4 w-full h-full ${getAvatarColor()} flex items-center justify-center`}
          >
            <svg width="74" height="76" viewBox="0 0 74 76" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
              <ellipse cx="37.5" cy="19.5" rx="16.5" ry="19.5" fill="white"/>
              <path d="M56.6014 45C59.4424 45 62.0016 46.7171 63.0788 49.346L70.0444 66.346C71.9315 70.9517 68.5443 76 63.567 76H10.1299C5.2345 76 1.85105 71.1037 3.58218 66.5246L10.009 49.5246C11.0385 46.8016 13.6457 45 16.5568 45H56.6014Z" fill="white"/>
            </svg>
          </div>
        )}
      </div>

      {/* Text information */}
      <div className={`text-center absolute z-10 bg-white rounded-lg p-2 min-w-[120px] left-1/2 -translate-x-1/2 top-[90px] outline outline-[#E1CD34] ${isSelected ? 'outline-[8px]' : 'outline-[2px]'}`}>
        <div className="font-bold text-sm text-gray-900">{fullName}</div>
        {role && (
          <div className="text-xs text-gray-600 mt-0.5 font-normal">{role}</div>
        )}
        {(birthYear || deathYear) && (
          <div className="text-xs text-gray-500 mt-1">
            {birthYear}
            {deathYear && ` - ${deathYear}`}
          </div>
        )}
      </div>

      {/* Handle at bottom (for outgoing connections) - right below text block */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 absolute top-[150px] left-1/2 -translate-x-1/2"
      />

      {/* Tree trunk for main person - only in ancestors mode */}
      {isMainPerson && !showDescendants && (
        <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-0 w-32">
          <Image
            src="/tree/trunk.svg"
            alt="Tree trunk"
            width={128}
            height={160}
            className="w-[128px] h-[160px]"
            unoptimized
      />
    </div>
  )}
</div>
);
}
