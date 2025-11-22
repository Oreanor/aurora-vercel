'use client';

import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FamilyTree from '@/components/features/family-tree';
import { useTree } from '@/contexts/tree-context';

export default function TreePage() {
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
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect is handled in useEffect
  }

  if (error && !treeData) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!selectedTreeId) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Please select a tree from the navigation</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Tree */}
      {treeData && (
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <FamilyTree 
            data={treeData} 
            className="h-full" 
            currentUserEmail={currentUserEmail}
          />
        </div>
      )}
    </div>
  );
}
