import { FamilyTree, FamilyTreeData } from '@/types/family';

/**
 * Информация о дереве в списке доступных деревьев
 */
export interface TreeInfo {
  id: string;
  name?: string;
  role: 'owner' | 'editor' | 'viewer';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Ответ API со списком доступных деревьев
 */
export interface TreesResponse {
  trees: TreeInfo[];
  count: number;
}

/**
 * Получить список доступных деревьев для пользователя
 * @param email - Email пользователя
 * @returns Список доступных деревьев
 */
export async function getAvailableTrees(email: string): Promise<TreesResponse> {
  const response = await fetch(`/api/trees?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trees: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Получить данные конкретного дерева по ID
 * @param treeId - ID дерева
 * @returns Данные дерева
 */
export async function getTreeById(treeId: string): Promise<FamilyTree> {
  const response = await fetch(`/api/trees/${treeId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tree: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Создать новое дерево
 * @param email - Email пользователя
 * @param treeData - Данные дерева
 * @returns Информация о созданном дереве
 */
export async function createTree(email: string, treeData: FamilyTreeData): Promise<TreeInfo> {
  const response = await fetch('/api/trees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      treeData: {
        data: treeData,
      },
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create tree: ${response.statusText}`);
  }
  
  return response.json();
}

