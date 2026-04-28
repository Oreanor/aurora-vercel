'use client';

import { Network, UserStar } from 'lucide-react';
import { Person } from '@/types/family';
import { getPersonFullName } from '@/lib/utils';
import { useI18n } from '@/components/providers/i18n-provider';

interface FamilyTreeToolbarProps {
  expandedSiblingPerson: Person | null;
  showDescendants: boolean;
  onAddPerson: () => void;
  onFlipTree: () => void;
  onSetRoot: () => void;
  onCloseBranch: () => void;
  flipDisabled?: boolean;
}

export default function FamilyTreeToolbar({
  expandedSiblingPerson,
  showDescendants,
  onAddPerson,
  onFlipTree,
  onSetRoot,
  onCloseBranch,
  flipDisabled = false,
}: FamilyTreeToolbarProps) {
  const { t } = useI18n();

  return (
    <>
      <button
        onClick={onAddPerson}
        className="absolute top-4 left-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-green-400 text-white shadow-lg transition-colors hover:bg-green-500 dark:text-sky-950"
        aria-label={t("familyTreeToolbar.addNewPersonAria")}
        title={t("familyTreeToolbar.addPersonTitle")}
      >
        <span className="relative -top-1 text-5xl leading-none">+</span>
      </button>

      <button
        onClick={onFlipTree}
        disabled={flipDisabled}
        className="absolute top-20 left-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-green-400 text-white shadow-lg transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-400 dark:text-sky-950"
        aria-label={t("familyTreeToolbar.toggleTreeAria")}
        title={flipDisabled ? t("familyTreeToolbar.toggleTreeDisabledTitle") : t("familyTreeToolbar.toggleTreeTitle")}
      >
        <Network className="h-6 w-6" style={{ transform: showDescendants ? 'scaleY(1)' : 'scaleY(-1)' }} />
      </button>

      <button
        onClick={onSetRoot}
        className="absolute top-36 left-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-green-400 text-white shadow-lg transition-colors hover:bg-green-500 dark:text-sky-950"
        aria-label={t("familyTreeToolbar.setRootUserAria")}
        title={t("familyTreeToolbar.setRootTitle")}
      >
        <UserStar className="h-6 w-6" />
      </button>

      {expandedSiblingPerson && (
        <div className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/15">
          <span className="text-sm text-amber-900 dark:text-amber-100">
            {t("familyTreeToolbar.viewingDescendants", {
              name: getPersonFullName(expandedSiblingPerson),
            })}
          </span>
          <button
            type="button"
            onClick={onCloseBranch}
            className="cursor-pointer text-sm font-medium text-amber-800 underline hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-50"
          >
            {t("common.close")}
          </button>
        </div>
      )}
    </>
  );
}
