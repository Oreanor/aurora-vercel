import FamilyTree from '@/components/features/family-tree';
import { mockFamilyData } from '@/lib/mock-family-data';

export default function TreePage() {
  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Tree</h1>
        <p className="text-gray-600">Visualize your family history and relationships.</p>
      </div>
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <FamilyTree data={mockFamilyData} className="h-full" />
      </div>
    </div>
  );
}
