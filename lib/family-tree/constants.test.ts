import { describe, it, expect } from 'vitest';
import {
  BRANCH_LEVEL_SPACING,
  BRANCH_MIN_SPOUSE_DISTANCE,
  BRANCH_MARRIAGE_BLOCK_WIDTH,
  BRANCH_ANCHOR_OFFSET_X,
  TREE_NODE_WIDTH,
  TREE_NODE_HEIGHT,
  TREE_BEAD_WIDTH,
} from './constants';

describe('constants', () => {
  it('export numeric layout constants', () => {
    expect(BRANCH_LEVEL_SPACING).toBe(250);
    expect(BRANCH_MIN_SPOUSE_DISTANCE).toBe(200);
    expect(BRANCH_MARRIAGE_BLOCK_WIDTH).toBe(TREE_NODE_WIDTH + BRANCH_MIN_SPOUSE_DISTANCE);
    expect(BRANCH_ANCHOR_OFFSET_X).toBe(280);
    expect(TREE_NODE_WIDTH).toBe(200);
    expect(TREE_NODE_HEIGHT).toBe(180);
    expect(TREE_BEAD_WIDTH).toBe(72);
  });
});
