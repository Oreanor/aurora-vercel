'use client';

import { useSession } from 'next-auth/react';
import FamilyTree from '@/components/features/family-tree';
import { mockFamilyData } from '@/lib/mock-family-data';

export default function TreePage() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email || undefined;

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <FamilyTree 
          data={mockFamilyData} 
          className="h-full" 
          currentUserEmail={currentUserEmail}
        />
      </div>
    </div>
  );
}
