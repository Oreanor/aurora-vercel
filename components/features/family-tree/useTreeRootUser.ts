'use client';

import { useState, useCallback } from 'react';

interface UseTreeRootUserProps {
  selectedNodeId: string | null;
  mainPersonId: string | null | undefined;
  selectedRootPersonId: string | null;
  setSelectedRootPersonId: (id: string | null) => void;
  onResetFit: () => void;
  onClearExpandedSibling: () => void;
}

export function useTreeRootUser({
  selectedNodeId,
  mainPersonId,
  selectedRootPersonId,
  setSelectedRootPersonId,
  onResetFit,
  onClearExpandedSibling,
}: UseTreeRootUserProps) {
  const [tempSelectedRootPersonId, setTempSelectedRootPersonId] = useState<string | null>(null);
  const [isRootUserDialogOpen, setIsRootUserDialogOpen] = useState(false);

  const openRootDialog = useCallback(() => {
    onClearExpandedSibling();
    if (selectedNodeId) {
      setSelectedRootPersonId(selectedNodeId);
      onResetFit();
    } else {
      setTempSelectedRootPersonId(selectedRootPersonId ?? mainPersonId ?? null);
      setIsRootUserDialogOpen(true);
    }
  }, [selectedNodeId, selectedRootPersonId, mainPersonId, setSelectedRootPersonId, onResetFit, onClearExpandedSibling]);

  const handleRebuildTree = useCallback(() => {
    if (tempSelectedRootPersonId) {
      setSelectedRootPersonId(tempSelectedRootPersonId);
      onResetFit();
    }
    onClearExpandedSibling();
    setIsRootUserDialogOpen(false);
  }, [tempSelectedRootPersonId, setSelectedRootPersonId, onResetFit, onClearExpandedSibling]);

  const handleCancelRootUser = useCallback(() => {
    setTempSelectedRootPersonId(null);
    setIsRootUserDialogOpen(false);
  }, []);

  return {
    isRootUserDialogOpen,
    tempSelectedRootPersonId,
    setTempSelectedRootPersonId,
    openRootDialog,
    handleRebuildTree,
    handleCancelRootUser,
  };
}
