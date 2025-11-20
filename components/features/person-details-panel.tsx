'use client';

import Image from 'next/image';
import { Person } from '@/types/family';

interface PersonDetailsPanelProps {
  person: Person;
  fullName: string;
  onClose?: () => void;
}

export default function PersonDetailsPanel({ person, fullName, onClose }: PersonDetailsPanelProps) {
  return (
    <div className="absolute right-0 top-0 h-full w-[min(50%,500px)] bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-4 cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-2">
              {person.birthDate && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Date of Birth: </span>
                  <span className="text-sm text-gray-900">
                    {new Date(person.birthDate).toLocaleDateString('en-US')}
                  </span>
                </div>
              )}
              {person.deathDate && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Date of Death: </span>
                  <span className="text-sm text-gray-900">
                    {new Date(person.deathDate).toLocaleDateString('en-US')}
                  </span>
                </div>
              )}
              {person.gender && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Gender: </span>
                  <span className="text-sm text-gray-900">
                    {person.gender === 'male' ? 'Male' : person.gender === 'female' ? 'Female' : 'Other'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Qualities */}
          {person.qualities && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualities</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Openness: </span>
                  <span className="text-sm text-gray-900">{person.qualities.openness}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Conscientiousness: </span>
                  <span className="text-sm text-gray-900">{person.qualities.conscientiousness}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Extraversion: </span>
                  <span className="text-sm text-gray-900">{person.qualities.extraversion}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Agreeableness: </span>
                  <span className="text-sm text-gray-900">{person.qualities.agreeableness}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Neuroticism: </span>
                  <span className="text-sm text-gray-900">{person.qualities.neuroticism}</span>
                </div>
                {person.qualities.religion && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Religion: </span>
                    <span className="text-sm text-gray-900">{person.qualities.religion}</span>
                  </div>
                )}
                {person.qualities.passions && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Passions: </span>
                    <span className="text-sm text-gray-900">{person.qualities.passions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo */}
          {person.photo && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Photo</h3>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={person.photo}
                  alt={fullName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

