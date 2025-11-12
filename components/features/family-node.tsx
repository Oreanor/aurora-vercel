'use client';

import { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Image from 'next/image';
import { Person, Relationship } from '@/types/family';
import { getPersonRole, getPersonFullName } from '@/lib/utils';

interface FamilyNodeData {
  person: Person;
  isMainPerson?: boolean; // Главный человек (внизу дерева)
  relationships?: Relationship[];
  mainPersonId?: string;
  persons?: Person[];
  isSelected?: boolean; // Выбран ли узел
}

interface FamilyNodeProps {
  data: FamilyNodeData;
  isConnectable?: boolean;
}

export default function FamilyNode({ data, isConnectable = false }: FamilyNodeProps) {
  const { person, isMainPerson = false, relationships = [], mainPersonId = '', persons = [], isSelected = false } = data;

  const fullName = getPersonFullName(person);

  const initial = person.firstName ? person.firstName.charAt(0).toUpperCase() : '';
  const last = person.lastName ? person.lastName.charAt(0).toUpperCase() : '';
  const initials = `${initial}${last}`;


  // Вычисляем роль персоны
  const role = useMemo(() => {
    if (!mainPersonId || relationships.length === 0 || persons.length === 0) {
      return '';
    }
    return getPersonRole(person.id, mainPersonId, relationships, persons);
  }, [person.id, mainPersonId, relationships, persons]);

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
    <div className={`relative flex flex-col items-center w-[200px] h-[100px]`}>
      {/* Handle сверху (для входящих связей) - в верхней части куста */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 top-[30px]"
      />

      {/* Кусты (фон и передний план) */}
      <Image
        src="/tree/bush_bg.svg"
        alt=""
        width={190}
        height={190}
        className={`absolute top-0 left-1/2 -translate-x-1/2 origin-center w-[190px] h-auto ${bushClasses}`}
        unoptimized
      />
      <Image
        src="/tree/bush.svg"
        alt=""
        width={180}
        height={180}
        className="absolute top-0 left-1/2 -translate-x-1/2 scale-[1.32] w-[180px] h-auto"
        unoptimized
      />

      {/* Аватар */}
      <div className={`avatar-container w-32 h-32 overflow-hidden rounded-[50%/50%] border-[#E1CD34] absolute z-10 left-1/2 -translate-x-1/2 -top-[30px] ${isSelected ? 'border-10' : 'border-4'}`}>
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
            className={`w-full h-full ${getAvatarColor()} flex items-center justify-center text-4xl font-semibold text-white`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Текстовая информация */}
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

      {/* Handle снизу (для исходящих связей) - сразу под текстовым блоком */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 absolute top-[150px] left-1/2 -translate-x-1/2"
      />

      {/* Ствол дерева для главного человека - сразу под текстовым блоком */}
      {isMainPerson && (
        <div className="absolute top-[40px] left-1/2 -translate-x-1/2 z-[1]">
          <Image
            src="/tree/trunk.svg"
            alt="Tree trunk"
            width={256}
            height={320}
            className="w-64 h-80 object-contain"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

