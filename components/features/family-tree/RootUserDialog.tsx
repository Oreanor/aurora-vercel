'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Person } from '@/types/family';
import { getPersonFullName } from '@/lib/utils';
import Button from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';

interface RootUserDialogProps {
  persons: Person[];
  tempSelectedRootPersonId: string | null;
  onSelect: (personId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RootUserDialog({
  persons,
  tempSelectedRootPersonId,
  onSelect,
  onConfirm,
  onCancel,
}: RootUserDialogProps) {
  const { t } = useI18n();
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-2xl font-bold text-gray-900 dark:text-white">{t("rootUserDialog.title")}</h2>
          <button
            ref={closeButtonRef}
            onClick={onCancel}
            className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p id={descriptionId} className="mb-4 text-gray-700 dark:text-gray-300">
          {t("rootUserDialog.description")}
        </p>

        <div className="mb-6 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
          {persons.map((person) => {
            const fullName = getPersonFullName(person);
            const isSelected = tempSelectedRootPersonId === person.id;
            return (
              <button
                key={person.id}
                onClick={() => onSelect(person.id)}
                className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                  isSelected
                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-300'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="font-medium">{fullName}</div>
                {person.email && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{person.email}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="flex-1"
            disabled={!tempSelectedRootPersonId}
          >
            {t("rootUserDialog.rebuildTree")}
          </Button>
        </div>
      </div>
    </div>
  );
}
