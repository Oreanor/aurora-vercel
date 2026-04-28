import { request } from "@/lib/api/client";
import { FamilyTree, FamilyTreeData } from "@/types/family";

/** Tree list item (id, name, role, timestamps). */
export interface TreeInfo {
  id: string;
  name?: string;
  role: "owner" | "editor" | "viewer";
  createdAt?: string;
  updatedAt?: string;
}

/** GET /api/trees response. */
export interface TreesResponse {
  trees: TreeInfo[];
  count: number;
}

/**
 * GET /api/trees — list trees available to the user.
 */
export async function getAvailableTrees(email: string): Promise<TreesResponse> {
  return request<TreesResponse>("/api/trees", { params: { email } });
}

/**
 * GET /api/trees/[id] — fetch a single tree by id.
 */
export async function getTreeById(treeId: string): Promise<FamilyTree> {
  return request<FamilyTree>(`/api/trees/${treeId}`);
}

/**
 * POST /api/trees — create a new tree.
 */
export async function createTree(
  email: string,
  treeData: FamilyTreeData
): Promise<TreeInfo> {
  return request<TreeInfo>("/api/trees", {
    method: "POST",
    body: JSON.stringify({
      email,
      treeData: { data: treeData },
    }),
  });
}

/**
 * PUT /api/trees/[id] — update tree data.
 */
export async function updateTree(
  treeId: string,
  treeData: FamilyTreeData
): Promise<FamilyTree> {
  return request<FamilyTree>(`/api/trees/${treeId}`, {
    method: "PUT",
    body: JSON.stringify({ treeData: { data: treeData } }),
  });
}
