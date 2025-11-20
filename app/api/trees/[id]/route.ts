import { NextRequest, NextResponse } from 'next/server';
import { mockFamilyTrees } from '@/lib/mock-family-data';
import { FamilyTree } from '@/types/family';

// Временное хранилище для созданных деревьев (должно совпадать с route.ts)
// В реальности это будет база данных
declare global {
  var userCreatedTrees: FamilyTree[] | undefined;
}

if (!global.userCreatedTrees) {
  global.userCreatedTrees = [];
}

/**
 * GET /api/trees/[id]
 * Возвращает данные конкретного дерева по ID
 * Эмуляция API запроса
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const treeId = params.id;
    
    // Ищем в мок-деревьях и созданных пользователем
    const allTrees = [...mockFamilyTrees, ...(global.userCreatedTrees || [])];
    const tree = allTrees.find(t => t.id === treeId);
    
    if (!tree) {
      return NextResponse.json(
        { error: 'Tree not found' },
        { status: 404 }
      );
    }

    // Эмуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      id: tree.id,
      name: tree.name,
      data: tree.data,
      access: tree.access,
      createdAt: tree.createdAt,
      updatedAt: tree.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching tree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

