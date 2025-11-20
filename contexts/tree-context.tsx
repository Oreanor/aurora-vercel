'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { getTreeById } from '@/lib/api/trees';
import { FamilyTree, FamilyTreeData } from '@/types/family';

interface TreeContextType {
  selectedTreeId: string | null;
  treeData: FamilyTreeData | null;
  isLoading: boolean;
  error: string | null;
  setSelectedTreeId: (treeId: string | null) => void;
  refreshTreeData: () => Promise<void>;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export function TreeProvider({ children }: { children: ReactNode }) {
  const [selectedTreeId, setSelectedTreeIdState] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<FamilyTreeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Загружаем данные дерева
  const loadTreeData = async (treeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const tree = await getTreeById(treeId);
      setTreeData(tree.data);
    } catch (err) {
      console.error('Error loading tree data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tree data');
      setTreeData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновляем выбранное дерево и синхронизируем с URL
  const setSelectedTreeId = (treeId: string | null) => {
    setSelectedTreeIdState(treeId);
    
    // Обновляем URL параметр без перехода
    const params = new URLSearchParams(searchParams.toString());
    if (treeId) {
      params.set('treeId', treeId);
    } else {
      params.delete('treeId');
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
    
    // Загружаем данные если treeId указан
    if (treeId) {
      loadTreeData(treeId);
    } else {
      setTreeData(null);
    }
  };

  // Функция для обновления данных дерева
  const refreshTreeData = async () => {
    if (selectedTreeId) {
      await loadTreeData(selectedTreeId);
    }
  };

  // Синхронизируем с URL параметром при монтировании и изменении URL
  useEffect(() => {
    const treeIdFromUrl = searchParams.get('treeId');
    if (treeIdFromUrl && treeIdFromUrl !== selectedTreeId) {
      // Не вызываем setSelectedTreeId, чтобы избежать цикла, обновляем напрямую
      setSelectedTreeIdState(treeIdFromUrl);
      loadTreeData(treeIdFromUrl);
    } else if (!treeIdFromUrl && selectedTreeId && pathname !== '/') {
      // Если treeId убран из URL и мы не на главной странице, сохраняем treeId в URL
      // Это нужно для сохранения параметра при навигации
      const params = new URLSearchParams();
      params.set('treeId', selectedTreeId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname]);

  return (
    <TreeContext.Provider
      value={{
        selectedTreeId,
        treeData,
        isLoading,
        error,
        setSelectedTreeId,
        refreshTreeData,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
}

export function useTree() {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}

