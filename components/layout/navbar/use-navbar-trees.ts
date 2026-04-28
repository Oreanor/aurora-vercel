"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { getAvailableTrees, type TreeInfo, createTree, getTreeById } from "@/lib/api/trees";
import { formatTreeNameShort } from "@/lib/utils/tree-format";
import type { FamilyTreeData, Person } from "@/types/family";

interface UseNavbarTreesOptions {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
  selectedTreeId: string | null;
  setSelectedTreeId: (treeId: string | null) => void;
  router: AppRouterInstance;
  treeFamilyLabel: string;
  createTreeErrorMessage: string;
}

async function loadTreeNames(
  trees: TreeInfo[],
  treeFamilyLabel: string,
  existing: Record<string, string> = {}
): Promise<Record<string, string>> {
  const names = { ...existing };
  await Promise.all(
    trees.map(async (tree) => {
      try {
        const fullTree = await getTreeById(tree.id);
        names[tree.id] = formatTreeNameShort(fullTree, treeFamilyLabel);
      } catch {
        names[tree.id] = tree.name || tree.id;
      }
    })
  );
  return names;
}

export function useNavbarTrees({
  session,
  status,
  pathname,
  searchParams,
  selectedTreeId,
  setSelectedTreeId,
  router,
  treeFamilyLabel,
  createTreeErrorMessage,
}: UseNavbarTreesOptions) {
  const [availableTrees, setAvailableTrees] = useState<TreeInfo[]>([]);
  const [treeNames, setTreeNames] = useState<Record<string, string>>({});
  const [showNoTreesModal, setShowNoTreesModal] = useState(false);
  const [showCreateFirstPerson, setShowCreateFirstPerson] = useState(false);
  const [createTreeError, setCreateTreeError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email || status !== "authenticated") {
      return;
    }

    const loadTrees = async () => {
      try {
        const response = await getAvailableTrees(session.user.email as string);

        const treesChanged =
          availableTrees.length !== response.trees.length ||
          availableTrees.some((tree, index) => tree.id !== response.trees[index]?.id);

        if (treesChanged) {
          setAvailableTrees(response.trees);
        }

        const treesToLoad = response.trees.filter((tree) => !treeNames[tree.id]);
        if (treesToLoad.length > 0) {
          setTreeNames(await loadTreeNames(treesToLoad, treeFamilyLabel, treeNames));
        }

        const treeIdFromUrl = searchParams.get("treeId");
        if (treeIdFromUrl) {
          if (treeIdFromUrl !== selectedTreeId) {
            setSelectedTreeId(treeIdFromUrl);
          }
        } else if (response.trees.length > 0) {
          const firstTreeId = response.trees[0].id;
          if (!selectedTreeId || firstTreeId !== selectedTreeId) {
            setSelectedTreeId(firstTreeId);
          }
        }
      } catch (err) {
        console.error("Error loading trees in navbar:", err);
      }
    };

    loadTrees();
  }, [
    availableTrees,
    pathname,
    searchParams,
    selectedTreeId,
    session?.user?.email,
    setSelectedTreeId,
    status,
    treeFamilyLabel,
    treeNames,
  ]);

  const handleCreateFirstTree = () => {
    setShowNoTreesModal(false);
    setCreateTreeError(null);
    setShowCreateFirstPerson(true);
  };

  const handleSaveFirstPerson = async (person: Omit<Person, "id">) => {
    if (!session?.user?.email) return;

    try {
      const treeData: FamilyTreeData = {
        persons: [
          {
            ...person,
            id: `person-${Date.now()}`,
          },
        ],
        relationships: [],
        spouseLinks: [],
      };

      const newTree = await createTree(session.user.email, treeData);
      const response = await getAvailableTrees(session.user.email);
      setAvailableTrees(response.trees);
      setTreeNames(await loadTreeNames(response.trees, treeFamilyLabel));
      setSelectedTreeId(newTree.id);
      setCreateTreeError(null);
      setShowCreateFirstPerson(false);
      router.push(`/tree?treeId=${newTree.id}`);
    } catch (err) {
      console.error("Error creating first tree:", err);
      setCreateTreeError(createTreeErrorMessage);
    }
  };

  return {
    availableTrees,
    treeNames,
    showNoTreesModal,
    setShowNoTreesModal,
    showCreateFirstPerson,
    setShowCreateFirstPerson,
    createTreeError,
    handleCreateFirstTree,
    handleSaveFirstPerson,
  };
}
