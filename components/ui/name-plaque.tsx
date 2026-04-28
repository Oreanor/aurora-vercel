'use client';

import { cn } from '@/lib/utils';
import { outlineWidthTree, outlineWidthTreeActive, treeAccent } from '@/lib/theme';

interface NamePlaqueProps {
  isSelected?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function NamePlaque({
  isSelected = false,
  className,
  children,
}: NamePlaqueProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white text-center outline shadow-sm dark:bg-slate-800 dark:shadow-black/30',
        className
      )}
      style={{
        outlineWidth: isSelected ? outlineWidthTreeActive : outlineWidthTree,
        outlineColor: treeAccent,
      }}
    >
      {children}
    </div>
  );
}
