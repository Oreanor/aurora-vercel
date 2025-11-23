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
 * GET /api/trees
 * Returns a list of tree IDs available to the current user
 * API request emulation - in production this will query the database
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

    // Combine mock trees and user-created trees
    const allTrees = [...mockFamilyTrees, ...(global.userCreatedTrees || [])];
    
    // Filter trees that the user has access to
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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return all accessible trees (including mock trees)
    return NextResponse.json({
      trees: accessibleTrees,
      count: accessibleTrees.length,
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
 * Creates a new tree for the user
 * API request emulation
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

    // Create a new tree
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

    // Save to temporary in-memory storage
    // TODO: Replace with database save through backend
    if (!global.userCreatedTrees) {
      global.userCreatedTrees = [];
    }
    global.userCreatedTrees.push(newTree);

    // Simulate network delay
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
