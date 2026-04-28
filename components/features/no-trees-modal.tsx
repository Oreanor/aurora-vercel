'use client';

import { X } from 'lucide-react';
import Button from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';

interface NoTreesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTree: () => void;
}

export default function NoTreesModal({ isOpen, onClose, onCreateTree }: NoTreesModalProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{t("noTreesModal.title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-700 mb-6">
          {t("noTreesModal.description")}
        </p>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("common.close")}
          </Button>
          <Button
            variant="primary"
            onClick={onCreateTree}
            className="flex-1"
          >
            {t("common.createTree")}
          </Button>
        </div>
      </div>
    </div>
  );
}

