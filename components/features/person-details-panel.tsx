'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Person, Relationship } from '@/types/family';
import { Edit, Trash2, MessageCircle } from 'lucide-react';
import { getPersonFullName, findAllAncestors } from '@/lib/utils';

function getParents(personId: string, persons: Person[], relationships: Relationship[]): Person[] {
  const parentIds = relationships
    .filter((r) => r.childId === personId)
    .map((r) => r.parentId);
  return parentIds
    .map((id) => persons.find((p) => p.id === id))
    .filter((p): p is Person => p != null);
}
import Button from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';

interface PersonDetailsPanelProps {
  person: Person;
  fullName: string;
  onClose?: () => void;
  isMainPerson?: boolean; // Whether this person is the root/main person
  onDelete?: (personId: string) => void; // Callback for delete action
  onEdit?: (person: Person) => void; // Callback for edit action - opens edit panel
  persons?: Person[]; // All persons for finding ancestors
  relationships?: Relationship[]; // All relationships for finding ancestors
  /** Tree ID for chatroom navigation (preserves tree context) */
  treeId?: string | null;
}

export default function PersonDetailsPanel({ 
  person, 
  fullName, 
  onClose, 
  isMainPerson = false,
  onDelete,
  onEdit,
  persons = [],
  relationships = [],
  treeId,
}: PersonDetailsPanelProps) {
  const { t, formatDate } = useI18n();
  const router = useRouter();
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

  const baseParams = treeId ? `personId=${person.id}&treeId=${treeId}` : `personId=${person.id}`;

  const handleChatClick = () => {
    router.push(`/chatroom?${baseParams}`);
  };

  return (
    <div 
      className="fixed inset-x-0 bottom-0 top-15 z-55 flex w-full flex-col border-l border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 md:absolute md:right-0 md:top-0 md:h-full md:w-[min(50%,500px)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800 md:p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">{fullName}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 cursor-pointer text-2xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={t("common.close")}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-3 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Basic Information */}
          <div>
            <div className="mb-2 flex items-center justify-between md:mb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white md:text-lg">{t("personDetails.basicInformation")}</h3>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(person)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white md:p-2"
                  aria-label={t("personDetails.editAria")}
                  title={t("personDetails.editAria")}
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!isMainPerson && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/40 md:p-2"
                    aria-label={t("personDetails.deleteAria")}
                    title={t("personDetails.deleteAria")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              {person.birthDate && (
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.dateOfBirth")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">
                    {formatDate(person.birthDate)}
                  </span>
                </div>
              )}
              {person.deathDate && (
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.dateOfDeath")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">
                    {formatDate(person.deathDate)}
                  </span>
                </div>
              )}
              {person.gender && (
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.gender")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">
                    {person.gender === 'male' ? t("common.male") : person.gender === 'female' ? t("common.female") : t("common.other")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Parents */}
          {(() => {
            const parents = getParents(person.id, persons, relationships);
            if (parents.length === 0) return null;
            return (
              <div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white md:mb-3 md:text-lg">{t("personDetails.parents")}</h3>
                <ul className="space-y-1 text-xs text-gray-900 dark:text-gray-100 md:text-sm">
                  {parents.map((p) => (
                    <li key={p.id}>{getPersonFullName(p)}</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Biography */}
          {person.biography && (
            <div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white md:mb-3 md:text-lg">{t("personDetails.biography")}</h3>
              <p className="whitespace-pre-wrap text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.biography}</p>
            </div>
          )}

          {/* Hobbies */}
          {person.hobbies && (
            <div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white md:mb-3 md:text-lg">{t("personDetails.hobbies")}</h3>
              <p className="whitespace-pre-wrap text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.hobbies}</p>
            </div>
          )}

          {/* Qualities */}
          {person.qualities && (
            <div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white md:mb-3 md:text-lg">{t("personDetails.qualities")}</h3>
              <div className="space-y-1.5 md:space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.openness")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.openness}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.conscientiousness")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.conscientiousness}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.extraversion")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.extraversion}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.agreeableness")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.agreeableness}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.neuroticism")}: </span>
                  <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.neuroticism}</span>
                </div>
                {person.qualities.religion && (
                  <div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.religion")}: </span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.religion}</span>
                  </div>
                )}
                {person.qualities.passions && (
                  <div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t("personDetails.passions")}: </span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 md:text-sm">{person.qualities.passions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo */}
          {person.photo && (
            <div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white md:mb-3 md:text-lg">{t("personDetails.photo")}</h3>
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

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-950 md:p-6">
        <Button
          type="button"
          variant="primary"
          onClick={handleChatClick}
          className="flex w-full items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          {t("personDetails.chat")}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">{t("personDetails.confirmDeletion")}</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              {t("personDetails.confirmDeletionMessage", { name: fullName })}
            </p>
            {ancestorsToDelete.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-red-600 font-medium mb-2">
                  {t("personDetails.deleteAncestorsWarning")}
                </p>
                <ul className="max-h-40 list-inside list-disc overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
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
                className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

