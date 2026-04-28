import { NextRequest, NextResponse } from 'next/server';
import { mockFamilyTrees } from '@/lib/mock-family-data';
import { FamilyTree } from '@/types/family';

// TEMPORARY STORAGE: Data is stored only in server memory
// All data is lost when the server restarts
// TODO: Replace with backend/database connection
declare global {
  var userCreatedTrees: FamilyTree[] | undefined;
}

if (!global.userCreatedTrees) {
  global.userCreatedTrees = [];
}

/**
 * GET /api/trees/[id]
 * Returns data for a specific tree by ID
 * API request emulation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const treeId = id;
    
    // Search in mock trees and user-created trees
    const allTrees = [...mockFamilyTrees, ...(global.userCreatedTrees || [])];
    const tree = allTrees.find(t => t.id === treeId);
    
    if (!tree) {
      return NextResponse.json(
        { error: 'Tree not found' },
        { status: 404 }
      );
    }

    // Simulate network delay
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

/**
 * PUT /api/trees/[id]
 * Updates tree data
 * API request emulation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const treeId = id;
    const body = await request.json();
    const { treeData } = body;

    if (!treeData) {
      return NextResponse.json(
        { error: 'Tree data is required' },
        { status: 400 }
      );
    }

    // Find tree in user-created trees (don't update mock trees)
    // TODO: Replace with backend/database update
    const treeIndex = global.userCreatedTrees?.findIndex(t => t.id === treeId);
    
    if (treeIndex === undefined || treeIndex === -1) {
      return NextResponse.json(
        { error: 'Tree not found or cannot be updated' },
        { status: 404 }
      );
    }

    // Update tree data in memory
    if (global.userCreatedTrees) {
      global.userCreatedTrees[treeIndex] = {
        ...global.userCreatedTrees[treeIndex],
        data: treeData.data || treeData,
        updatedAt: new Date().toISOString(),
      };
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      id: global.userCreatedTrees![treeIndex].id,
      name: global.userCreatedTrees![treeIndex].name,
      data: global.userCreatedTrees![treeIndex].data,
      access: global.userCreatedTrees![treeIndex].access,
      createdAt: global.userCreatedTrees![treeIndex].createdAt,
      updatedAt: global.userCreatedTrees![treeIndex].updatedAt,
    });
  } catch (error) {
    console.error('Error updating tree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

