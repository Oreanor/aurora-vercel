'use client';

import { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';
import { Person, Relationship } from '@/types/family';
import { getPersonRole, getPersonFullName, getPersonInitial } from '@/lib/utils';
import { useI18n } from '@/components/providers/i18n-provider';
import { translateFamilyRole } from '@/lib/i18n-role';
import {
  getAvatarBgClass,
  borderWidthTreeAvatar,
  borderWidthTreeAvatarActive,
  outlineWidthTree,
  outlineWidthTreePlaqueActive,
  treeAccent,
} from '@/lib/theme';
import { TREE_NODE_WIDTH, TREE_BEAD_WIDTH } from '@/lib/family-tree/constants';

interface FamilyNodeData {
  person: Person;
  isMainPerson?: boolean; // Main person (at bottom of tree)
  siblings?: Person[]; // Siblings (for main person: beads to the right)
  onSiblingClick?: (personId: string) => void; // When a sibling bead is clicked (expand branch)
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
  const { t } = useI18n();
  const { person, isMainPerson = false, siblings = [], onSiblingClick, relationships = [], mainPersonId = '', persons = [], isSelected = false, showDescendants = false } = data;

  const fullName = getPersonFullName(person);


  // Calculate person's role
  const role = useMemo(() => {
    if (!mainPersonId || relationships.length === 0 || persons.length === 0) {
      return '';
    }
    return getPersonRole(person.id, mainPersonId, relationships, persons);
  }, [person.id, mainPersonId, relationships, persons]);

  const avatarBgClass = getAvatarBgClass(person.gender, isMainPerson);

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;
  const deathYear = person.deathDate
    ? new Date(person.deathDate).getFullYear()
    : null;

  const showSiblingBeads = siblings.length > 0;
  const nodeContentWidth = showSiblingBeads ? TREE_NODE_WIDTH + siblings.length * TREE_BEAD_WIDTH : TREE_NODE_WIDTH;
  const localizedRole = role ? translateFamilyRole(role, t) : '';

  const beadAvatarBgClass = (p: Person) => getAvatarBgClass(p.gender, false);

  return (
    <div className={`relative flex flex-row items-start gap-0 ${isMainPerson && !showDescendants ? 'h-[450px]' : 'h-[100px]'}`} style={{ width: nodeContentWidth }}>
      {/* Main person card (left part) */}
      <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: TREE_NODE_WIDTH }}>
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
          className="absolute top-0 left-1/2 z-[2] h-auto w-auto -translate-x-1/2 scale-[1.45] dark:[filter:brightness(0.6)_hue-rotate(110deg)_saturate(0.88)_contrast(0.95)]"
          unoptimized
        />

        {/* Avatar */}
        <div
          className="avatar-container w-36 h-36 overflow-hidden rounded-[50%/50%] border absolute z-10 left-1/2 -translate-x-1/2 -top-[40px]"
          style={{
            borderWidth: isSelected ? borderWidthTreeAvatarActive : borderWidthTreeAvatar,
            borderColor: treeAccent,
          }}
        >
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
              className={`pt-4 w-full h-full ${avatarBgClass} flex items-center justify-center`}
            >
              <svg width="74" height="76" viewBox="0 0 74 76" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
                <ellipse cx="37.5" cy="19.5" rx="16.5" ry="19.5" fill="white"/>
                <path d="M56.6014 45C59.4424 45 62.0016 46.7171 63.0788 49.346L70.0444 66.346C71.9315 70.9517 68.5443 76 63.567 76H10.1299C5.2345 76 1.85105 71.1037 3.58218 66.5246L10.009 49.5246C11.0385 46.8016 13.6457 45 16.5568 45H56.6014Z" fill="white"/>
              </svg>
            </div>
          )}
        </div>

        {/* Text information */}
        <div
          className="absolute left-1/2 top-[90px] z-10 min-w-[120px] -translate-x-1/2 rounded-lg bg-white p-2 text-center outline shadow-sm dark:bg-slate-800 dark:shadow-black/30"
          style={{
            outlineWidth: isSelected ? outlineWidthTreePlaqueActive : outlineWidthTree,
            outlineColor: treeAccent,
          }}
        >
          <div className="text-sm font-bold text-gray-900 dark:text-white">{fullName}</div>
          {localizedRole && (
            <div className="mt-0.5 text-xs font-normal text-gray-600 dark:text-gray-300">{localizedRole}</div>
          )}
          {(birthYear || deathYear) && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
              alt={t("familyTree.treeTrunkAlt")}
              width={128}
              height={160}
              className="w-[128px] h-[160px]"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Sibling beads to the right of main person (larger, on top, clickable) */}
      {showSiblingBeads && (
        <div className="flex flex-row items-center gap-1 pl-0 flex-shrink-0 mt-2 z-20 relative">
          {siblings.map((sib) => (
            <button
              key={sib.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSiblingClick?.(sib.id);
              }}
              className="flex flex-col items-center w-[64px] cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-tree-accent focus-visible:ring-offset-1 rounded-lg transition-opacity"
              title={getPersonFullName(sib)}
            >
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-md ${sib.photo ? '' : beadAvatarBgClass(sib)} flex items-center justify-center`}
                style={{ borderColor: treeAccent }}
              >
                {sib.photo ? (
                  <Image
                    src={sib.photo}
                    alt={getPersonFullName(sib)}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-white text-lg font-medium">{getPersonInitial(sib)}</span>
                )}
              </div>
              <div
                className="mt-1 w-[64px] line-clamp-2 break-words rounded bg-white px-1 py-0.5 text-center text-[10px] font-semibold leading-tight text-gray-800 outline outline-1 outline-gray-200 shadow-sm dark:bg-slate-800 dark:text-gray-100 dark:outline-gray-700 dark:shadow-black/30"
                title={getPersonFullName(sib)}
              >
                {[sib.firstName, sib.middleName].filter(Boolean).join(' ')}
                <br />
                {sib.lastName}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
