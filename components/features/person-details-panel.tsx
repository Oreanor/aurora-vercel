'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Person, Relationship } from '@/types/family';
import { Edit, Trash2 } from 'lucide-react';
import { getPersonFullName, findAllAncestors } from '@/lib/utils';

interface PersonDetailsPanelProps {
  person: Person;
  fullName: string;
  onClose?: () => void;
  isMainPerson?: boolean; // Whether this person is the root/main person
  onDelete?: (personId: string) => void; // Callback for delete action
  onEdit?: (person: Person) => void; // Callback for edit action - opens edit panel
  persons?: Person[]; // All persons for finding ancestors
  relationships?: Relationship[]; // All relationships for finding ancestors
}

export default function PersonDetailsPanel({ 
  person, 
  fullName, 
  onClose, 
  isMainPerson = false,
  onDelete,
  onEdit,
  persons = [],
  relationships = []
}: PersonDetailsPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ancestorsToDelete, setAncestorsToDelete] = useState<Person[]>([]);

  const handleDeleteClick = () => {
    const ancestors = findAllAncestors(person.id, persons, relationships);
    setAncestorsToDelete(ancestors);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(person.id);
    }
    setShowDeleteConfirm(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setAncestorsToDelete([]);
  };
  return (
    <div 
      className="absolute right-0 top-0 h-full w-[min(50%,500px)] bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(person)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!isMainPerson && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>{fullName}</strong>?
            </p>
            {ancestorsToDelete.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-red-600 font-medium mb-2">
                  Warning: The following ancestors will also be deleted:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 max-h-40 overflow-y-auto">
                  {ancestorsToDelete.map((ancestor) => (
                    <li key={ancestor.id}>{getPersonFullName(ancestor)}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

