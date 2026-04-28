"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  getPersonRole,
  sortFamilyMembersByRole,
  findMainPersonId,
  getPersonFullName,
} from "@/lib/utils";
import { useTree } from "@/contexts/tree-context";
import type { Person } from "@/types/family";

export interface FamilyMemberOption {
  person: Person;
  role: string;
}

export interface UseCallPageSelectionResult {
  session: ReturnType<typeof useSession>["data"];
  treeData: ReturnType<typeof useTree>["treeData"];
  selectedTreeId: string | null;
  mainPersonId: string;
  familyMembers: FamilyMemberOption[];
  selectedPersonId: string;
  setSelectedPersonId: (id: string) => void;
  selectedPerson: Person | null;
  selectedPersonRole: string;
  signInRequired: boolean;
  treeRequired: boolean;
  getPersonFullName: (person: Person) => string;
}

export function useCallPageSelection(): UseCallPageSelectionResult {
  const { data: session } = useSession();
  const { treeData, selectedTreeId } = useTree();
  const [selectedPersonId, setSelectedPersonId] = useState("");

  const mainPersonId = useMemo(() => {
    if (!treeData) return "";
    return findMainPersonId(
      treeData.persons,
      treeData.relationships,
      session?.user?.email ?? undefined
    );
  }, [treeData, session?.user?.email]);

  const familyMembers = useMemo(() => {
    if (!treeData || !mainPersonId) return [];
    const members = treeData.persons
      .filter((person) => person.id !== mainPersonId)
      .map((person) => ({
        person,
        role: getPersonRole(
          person.id,
          mainPersonId,
          treeData.relationships,
          treeData.persons
        ),
      }));
    return sortFamilyMembersByRole(members);
  }, [treeData, mainPersonId]);

  const selectedPerson = useMemo(() => {
    if (!treeData || !selectedPersonId) return null;
    return treeData.persons.find((p) => p.id === selectedPersonId) ?? null;
  }, [treeData, selectedPersonId]);

  const selectedPersonRole = useMemo(() => {
    if (!selectedPersonId || !mainPersonId || !treeData) return "";
    return getPersonRole(
      selectedPersonId,
      mainPersonId,
      treeData.relationships,
      treeData.persons
    );
  }, [selectedPersonId, mainPersonId, treeData]);

  return {
    session,
    treeData,
    selectedTreeId,
    mainPersonId,
    familyMembers,
    selectedPersonId,
    setSelectedPersonId,
    selectedPerson,
    selectedPersonRole,
    signInRequired: !session,
    treeRequired: !selectedTreeId || !treeData,
    getPersonFullName,
  };
}
