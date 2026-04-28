'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
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
  // Track last loaded treeId to avoid reloading
  const lastLoadedTreeIdRef = useRef<string | null>(null);

  // Load tree data - memoized with useCallback
  const loadTreeData = useCallback(async (treeId: string) => {
    // Skip loading if data is already loaded for this treeId
    if (lastLoadedTreeIdRef.current === treeId) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const tree = await getTreeById(treeId);
      setTreeData(tree.data);
      lastLoadedTreeIdRef.current = treeId;
    } catch (err) {
      console.error('Error loading tree data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tree data');
      setTreeData(null);
      lastLoadedTreeIdRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update selected tree and sync with URL - memoized with useCallback
  // Data loading happens through useEffect that watches URL changes
  const setSelectedTreeId = useCallback((treeId: string | null) => {
    // Update state immediately for synchronization
    setSelectedTreeIdState(treeId);
    
    // Update URL parameter without navigation
    // useEffect will automatically load data when URL changes
    const params = new URLSearchParams(searchParams.toString());
    if (treeId) {
      params.set('treeId', treeId);
    } else {
      params.delete('treeId');
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
    
    // If treeId is null, clear data immediately
    if (!treeId) {
      setTreeData(null);
      lastLoadedTreeIdRef.current = null;
    }
  }, [searchParams, pathname, router]);

  // Function to refresh tree data - memoized with useCallback
  const refreshTreeData = useCallback(async () => {
    if (selectedTreeId) {
      // Reset ref to force reload data
      lastLoadedTreeIdRef.current = null;
      await loadTreeData(selectedTreeId);
    }
  }, [selectedTreeId, loadTreeData]);

  // Sync with URL parameter on mount and URL changes
  useEffect(() => {
    const treeIdFromUrl = searchParams.get('treeId');
    
    if (treeIdFromUrl) {
      // Update state if different from current
      if (treeIdFromUrl !== selectedTreeId) {
        setSelectedTreeIdState(treeIdFromUrl);
      }
      // Load data if not already loaded for this treeId
      if (lastLoadedTreeIdRef.current !== treeIdFromUrl) {
        loadTreeData(treeIdFromUrl);
      }
    } else if (!treeIdFromUrl && selectedTreeId && pathname !== '/') {
      // If treeId removed from URL and we're not on home page, save treeId to URL
      // This is needed to preserve parameter during navigation
      const params = new URLSearchParams();
      params.set('treeId', selectedTreeId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (!treeIdFromUrl && pathname === '/') {
      // On home page, keep selectedTreeId but don't load data
      // Don't clear selectedTreeId - it should persist in navbar
      // Only clear treeData if we're on home page
      if (treeData) {
        setTreeData(null);
        lastLoadedTreeIdRef.current = null;
      }
    } else if (!treeIdFromUrl && pathname !== '/') {
      // If treeId not in URL and not on home page, clear everything
      setSelectedTreeIdState(null);
      setTreeData(null);
      lastLoadedTreeIdRef.current = null;
    }
  }, [searchParams, pathname, selectedTreeId, router, loadTreeData, treeData]);

  // Memoize value object to avoid re-renders of all context consumers
  const value = useMemo(() => ({
    selectedTreeId,
    treeData,
    isLoading,
    error,
    setSelectedTreeId,
    refreshTreeData,
  }), [selectedTreeId, treeData, isLoading, error, setSelectedTreeId, refreshTreeData]);

  return (
    <TreeContext.Provider value={value}>
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

