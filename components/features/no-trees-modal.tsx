'use client';

import { X } from 'lucide-react';
import Button from '@/components/ui/button';

interface NoTreesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTree: () => void;
}

export default function NoTreesModal({ isOpen, onClose, onCreateTree }: NoTreesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Aurora!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-700 mb-6">
          You don&apos;t have any family trees yet. Let&apos;s create your first family tree!
        </p>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={onCreateTree}
            className="flex-1"
          >
            Create Tree
          </Button>
        </div>
      </div>
    </div>
  );
}

