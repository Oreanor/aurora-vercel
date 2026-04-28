'use client';

import { useState, useCallback } from 'react';
import { FamilyTreeData, Person } from '@/types/family';
import {
  addPersonToTree,
  deletePersonWithAncestors,
  updatePersonInTree,
} from '@/lib/family-tree/mutations';

interface UseTreePanelsProps {
  data: FamilyTreeData;
  setData: React.Dispatch<React.SetStateAction<FamilyTreeData>>;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export function useTreePanels({ data, setData, selectedNodeId, setSelectedNodeId }: UseTreePanelsProps) {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);

  const handleAddPerson = useCallback(
    (
      personData: Omit<Person, 'id'>,
      relationship?: { type: 'parent' | 'child' | 'spouse'; relatedPersonId: string }
    ) => {
      const nextData = addPersonToTree(data, personData, relationship);
      if (!nextData) return;
      setData(nextData);
      setIsAddPanelOpen(false);
    },
    [data, setData]
  );

  const handleDeletePerson = useCallback(
    (personId: string) => {
      const { deletedIds, nextData } = deletePersonWithAncestors(data, personId);
      setData(nextData);
      if (selectedNodeId === personId || deletedIds.includes(selectedNodeId ?? '')) {
        setSelectedNodeId(null);
      }
    },
    [data, setData, selectedNodeId, setSelectedNodeId]
  );

  const handleEditPerson = useCallback((person: Person) => {
    setPersonToEdit(person);
    setIsEditPanelOpen(true);
  }, []);

  const handleUpdatePerson = useCallback(
    (personId: string, personData: Omit<Person, 'id'>) => {
      setData((prev) => updatePersonInTree(prev, personId, personData));
      setIsEditPanelOpen(false);
      setPersonToEdit(null);
    },
    [setData]
  );

  return {
    isAddPanelOpen,
    setIsAddPanelOpen,
    isEditPanelOpen,
    setIsEditPanelOpen,
    personToEdit,
    setPersonToEdit,
    handleAddPerson,
    handleDeletePerson,
    handleEditPerson,
    handleUpdatePerson,
  };
}
