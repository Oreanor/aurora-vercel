import { NextRequest, NextResponse } from 'next/server';
import { mockFamilyTrees } from '@/lib/mock-family-data';
import { FamilyTree, FamilyTreeData } from '@/types/family';

// Временное хранилище для созданных деревьев (в реальности будет база данных)
declare global {
  var userCreatedTrees: FamilyTree[] | undefined;
}

if (!global.userCreatedTrees) {
  global.userCreatedTrees = [];
}

/**
 * GET /api/trees
 * Возвращает список ID деревьев, доступных текущему пользователю
 * Эмуляция API запроса - в реальности здесь будет запрос к базе данных
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Объединяем мок-деревья и созданные пользователем
    const allTrees = [...mockFamilyTrees, ...(global.userCreatedTrees || [])];
    
    // Фильтруем деревья, к которым у пользователя есть доступ
    const accessibleTrees = allTrees
      .filter(tree => {
        const { owner, editor, viewer } = tree.access;
        return (
          owner.includes(email) ||
          editor.includes(email) ||
          viewer.includes(email)
        );
      })
      .map(tree => ({
        id: tree.id,
        name: tree.name,
        role: tree.access.owner.includes(email) 
          ? 'owner' 
          : tree.access.editor.includes(email) 
          ? 'editor' 
          : 'viewer',
        createdAt: tree.createdAt,
        updatedAt: tree.updatedAt,
      }));

    // Эмуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    // Для эмуляции нового пользователя возвращаем только созданные деревья
    // Мок-деревья не возвращаем для новых пользователей
    const userTrees = global.userCreatedTrees || [];
    return NextResponse.json({
      trees: accessibleTrees.filter(tree => 
        userTrees.some(ut => ut.id === tree.id)
      ),
      count: accessibleTrees.filter(tree => 
        userTrees.some(ut => ut.id === tree.id)
      ).length,
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees
 * Создает новое дерево для пользователя
 * Эмуляция API запроса
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, treeData } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!treeData) {
      return NextResponse.json(
        { error: 'Tree data is required' },
        { status: 400 }
      );
    }

    // Создаем новое дерево
    const newTree: FamilyTree = {
      id: `tree-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: treeData.name || 'My Family Tree',
      data: treeData.data,
      access: {
        owner: [email],
        editor: [],
        viewer: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Сохраняем в временное хранилище (в реальности будет база данных)
    if (!global.userCreatedTrees) {
      global.userCreatedTrees = [];
    }
    global.userCreatedTrees.push(newTree);

    // Эмуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      id: newTree.id,
      name: newTree.name,
      role: 'owner',
      createdAt: newTree.createdAt,
      updatedAt: newTree.updatedAt,
    });
  } catch (error) {
    console.error('Error creating tree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
