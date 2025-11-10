'use client';

import { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';
import { Person } from '@/types/family';

interface FamilyNodeData {
  person: Person;
  isMainPerson?: boolean; // Главный человек (внизу дерева)
}

interface FamilyNodeProps {
  data: FamilyNodeData;
  isConnectable?: boolean;
}

export default function FamilyNode({ data, isConnectable = false }: FamilyNodeProps) {
  const { person, isMainPerson = false } = data;

  const fullName = [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(' ');

  const initial = person.firstName ? person.firstName.charAt(0).toUpperCase() : '?';

  // Детерминированные трансформации для кустов на основе ID персоны
  // Это гарантирует одинаковые значения на сервере и клиенте
  const bushClasses = useMemo(() => {
    // Простая хеш-функция для получения псевдослучайного значения из ID
    let hash = 0;
    for (let i = 0; i < person.id.length; i++) {
      hash = ((hash << 5) - hash) + person.id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Используем хеш для детерминированного выбора
    const rotateClass = Math.abs(hash) % 2 === 0 ? 'rotate-0' : 'rotate-180';
    const scaleOptions = ['scale-[1.25]', 'scale-[1.35]', 'scale-[1.45]'];
    const scaleIndex = Math.abs(hash) % scaleOptions.length;
    const scaleClass = scaleOptions[scaleIndex];
    
    return `${rotateClass} ${scaleClass}`;
  }, [person.id]);

  // Цвет фона для аватара
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
    <div className={`relative flex flex-col items-center w-[200px] ${isMainPerson ? 'h-[450px]' : 'h-[180px]'}`}>
      {/* Handle сверху (для входящих связей) - в верхней части куста */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 top-[30px]"
      />

      {/* Кусты (фон и передний план) */}
      <img
        src="/tree/bush_bg.svg"
        alt=""
        className={`absolute top-0 left-1/2 -translate-x-1/2 origin-center w-[190px] h-auto ${bushClasses}`}
      />
      <img
        src="/tree/bush.svg"
        alt=""
        className="absolute top-0 left-1/2 -translate-x-1/2 scale-[1.32] w-[180px] h-auto"
      />

      {/* Аватар */}
      <div className="avatar-container w-24 h-32 overflow-hidden rounded-[50%/50%] border-4 border-[#E1CD34] absolute z-10 left-1/2 -translate-x-1/2 -top-[30px]">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={fullName}
            width={64}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className={`w-full h-full ${getAvatarColor()} flex items-center justify-center text-lg font-semibold text-white`}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Текстовая информация */}
      <div className="text-center absolute z-10 bg-white border-[#E1CD34] border-2 rounded-lg p-2 min-w-[120px] left-1/2 -translate-x-1/2 top-[90px]">
        <div className="font-bold text-sm text-gray-900">{fullName}</div>
        {(birthYear || deathYear) && (
          <div className="text-xs text-gray-500 mt-1">
            {birthYear}
            {deathYear && ` - ${deathYear}`}
          </div>
        )}
      </div>

      {/* Handle снизу (для исходящих связей) - сразу под текстовым блоком */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 absolute top-[150px] left-1/2 -translate-x-1/2"
      />

      {/* Ствол дерева для главного человека - сразу под текстовым блоком */}
      {isMainPerson && (
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[1]">
          <img
            src="/tree/trunk.svg"
            alt="Tree trunk"
            className="w-64 h-80 object-contain"
          />
        </div>
      )}
    </div>
  );
}

