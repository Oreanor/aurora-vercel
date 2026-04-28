/**
 * Shared design tokens for family/tree UI.
 * Use these in JS (e.g. edge stroke, layout constants); use Tailwind classes (tree-accent, etc.) in components.
 */

export const treeAccent = '#e1cd34';
export const treeEdge = '#793333';

export const borderWidthTree = 3;
export const borderWidthTreeActive = 5;
/** Tree view avatar default border (legacy border-4). */
export const borderWidthTreeAvatar = 4;
/** Tree view uses thicker active border for main avatar (legacy border-10). */
export const borderWidthTreeAvatarActive = 10;
export const outlineWidthTree = 2;
export const outlineWidthTreeActive = 5;
/** Tree view plaque uses thicker active outline (same as legacy outline-[8px]). */
export const outlineWidthTreePlaqueActive = 8;

/** Avatar size for graph nodes (px). */
export const graphAvatarSize = 72;
/** Spouse ring diameter (px). */
export const ringSize = 28;
/** Graph node dimensions for layout (px). */
export const graphNodeWidth = 110;
export const graphNodeHeight = 100;

/** Tailwind class for avatar background by gender/main. */
export function getAvatarBgClass(
  gender: 'male' | 'female' | 'other' | undefined,
  isMainPerson?: boolean
): string {
  if (isMainPerson) return 'bg-avatar-main';
  if (gender === 'female') return 'bg-avatar-female';
  if (gender === 'male') return 'bg-avatar-male';
  return 'bg-avatar-neutral';
}
