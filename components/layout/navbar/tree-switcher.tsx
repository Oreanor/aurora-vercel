"use client";

import { ChevronDown, Network } from "lucide-react";
import type { RefObject } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { TreeInfo } from "@/lib/api/trees";

interface TreeSwitcherProps {
  availableTrees: TreeInfo[];
  selectedTreeId: string | null;
  treeNames: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (treeId: string) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
}

export default function TreeSwitcher({
  availableTrees,
  selectedTreeId,
  treeNames,
  isOpen,
  onToggle,
  onSelect,
  dropdownRef,
}: TreeSwitcherProps) {
  const { t } = useI18n();

  if (availableTrees.length === 0) {
    return null;
  }

  const selectedTree = selectedTreeId
    ? availableTrees.find((tree) => tree.id === selectedTreeId)
    : null;
  const selectedLabel = selectedTreeId
    ? `${treeNames[selectedTreeId] || selectedTree?.name || selectedTreeId}${
        selectedTree?.role === "owner" ? t("navbar.ownSuffix") : ""
      }`
    : t("navbar.selectTree");

  return (
    <div className="hidden md:flex items-center relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex cursor-pointer items-center space-x-1.5 text-sm text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
      >
        <Network className="h-4 w-4 rotate-180 text-gray-500" />
        <span className="font-semibold">{selectedLabel}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full -mt-1 pt-1 w-48 z-50">
          <div className="rounded-lg bg-white py-2 shadow-lg dark:bg-gray-900">
            {availableTrees.map((tree) => (
              <button
                key={tree.id}
                onClick={() => onSelect(tree.id)}
                className={`w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-green-400 dark:text-gray-200 dark:hover:bg-gray-800 ${
                  selectedTreeId === tree.id ? "bg-green-50 text-green-400 dark:bg-green-950/40" : ""
                }`}
              >
                <span className="font-semibold">
                  {treeNames[tree.id] || tree.name || tree.id}
                  {tree.role === "owner" && t("navbar.ownSuffix")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
