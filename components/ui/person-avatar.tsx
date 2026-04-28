'use client';

import Image from 'next/image';
import { Person } from '@/types/family';
import { getPersonFullName, getPersonInitial } from '@/lib/utils';
import { getAvatarBgClass, borderWidthTree, borderWidthTreeActive, treeAccent } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface PersonAvatarProps {
  person: Person;
  size?: number;
  isMainPerson?: boolean;
  isSelected?: boolean;
  className?: string;
}

export default function PersonAvatar({
  person,
  size = 72,
  isMainPerson = false,
  isSelected = false,
  className,
}: PersonAvatarProps) {
  const fullName = getPersonFullName(person);
  const bgClass = getAvatarBgClass(person.gender, isMainPerson);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[50%] border flex-shrink-0 flex items-center justify-center',
        className
      )}
      style={{
        width: size,
        height: size,
        borderWidth: isSelected ? borderWidthTreeActive : borderWidthTree,
        borderColor: treeAccent,
      }}
    >
      {person.photo ? (
        <Image
          src={person.photo}
          alt={fullName}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center', bgClass)}>
          <span
            className="font-medium text-white"
            style={{ fontSize: Math.round(size * 0.4) }}
          >
            {getPersonInitial(person)}
          </span>
        </div>
      )}
    </div>
  );
}
