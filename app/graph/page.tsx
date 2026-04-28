'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FamilyGraph from '@/components/features/family-graph';
import { useTree } from '@/contexts/tree-context';
import { findAllAncestorIds } from '@/lib/utils';
import { updateTree } from '@/lib/api/trees';
import { useI18n } from '@/components/providers/i18n-provider';

export default function GraphPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedTreeId, treeData, isLoading, error, refreshTreeData } = useTree();
  const currentUserEmail = useMemo(() => session?.user?.email ?? undefined, [session?.user?.email]);

  const handleDeletePerson = useCallback(
    async (personId: string) => {
      if (!selectedTreeId || !treeData) return;
      const ancestorIds = findAllAncestorIds(personId, treeData.relationships);
      const idsToRemove = new Set([personId, ...ancestorIds]);
      const newData = {
        persons: treeData.persons.filter((p) => !idsToRemove.has(p.id)),
        relationships: treeData.relationships.filter(
          (r) => !idsToRemove.has(r.parentId) && !idsToRemove.has(r.childId)
        ),
        spouseLinks: (treeData.spouseLinks ?? []).filter(
          (link) => !idsToRemove.has(link.personId1) && !idsToRemove.has(link.personId2)
        ),
      };
      await updateTree(selectedTreeId, newData);
      await refreshTreeData();
    },
    [selectedTreeId, treeData, refreshTreeData]
  );

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      router.push('/signin');
    }
  }, [session?.user?.email, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100 dark:bg-slate-950">
        <div className="text-gray-600 dark:text-gray-300">{t("common.loading")}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error && !treeData) {
    const localizedError =
      error === "Failed to load tree data" ? t("treePage.loadError") : error;
    return (
      <div className="flex h-full items-center justify-center bg-stone-100 dark:bg-slate-950">
        <div className="text-red-600">{t("common.errorWithMessage", { message: localizedError })}</div>
      </div>
    );
  }

  if (!selectedTreeId) {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100 dark:bg-slate-950">
        <div className="text-gray-600 dark:text-gray-300">{t("treePage.selectTree")}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-stone-100 dark:bg-slate-950">
      <div className="flex-shrink-0 border-b border-stone-200 bg-amber-100/70 px-4 py-2 dark:border-gray-800 dark:bg-slate-950/90">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{t("graphPage.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("graphPage.description")}
        </p>
      </div>
      {treeData && (
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <FamilyGraph
            data={treeData}
            className="h-full"
            currentUserEmail={currentUserEmail}
            treeId={selectedTreeId}
            onDeletePerson={handleDeletePerson}
          />
        </div>
      )}
    </div>
  );
}
