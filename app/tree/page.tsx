'use client';

import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FamilyTree from '@/components/features/family-tree';
import { useTree } from '@/contexts/tree-context';
import { useI18n } from '@/components/providers/i18n-provider';

export default function TreePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedTreeId, treeData, isLoading, error } = useTree();
  // Memoize email to avoid unnecessary re-renders of FamilyTree
  const currentUserEmail = useMemo(() => session?.user?.email || undefined, [session?.user?.email]);

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
    return null; // Redirect is handled in useEffect
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
      {/* Tree */}
      {treeData && (
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <FamilyTree 
            data={treeData} 
            className="h-full" 
            currentUserEmail={currentUserEmail}
            treeId={selectedTreeId}
          />
        </div>
      )}
    </div>
  );
}
