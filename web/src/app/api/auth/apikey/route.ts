import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { authenticateRequest } from '@/lib/firebase-admin';

// Generate a random API key
function generateApiKey(): string {
  return crypto.randomBytes(24).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    const { isAuthenticated, uid, error } = await authenticateRequest(authHeader);
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Ensure the user is only modifying their own data
    if (userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized access to user data' }, { status: 403 });
    }

    // Generate a new API key
    const newApiKey = generateApiKey();

    // Update the user's API key
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { api_key: newApiKey }
    });

    return NextResponse.json({
      apiKey: updatedUser.api_key
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    const { isAuthenticated, uid, error } = await authenticateRequest(authHeader);
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    const { userId, enabled } = await request.json();

    if (!userId || enabled === undefined) {
      return NextResponse.json({ error: 'User ID and enabled status are required' }, { status: 400 });
    }
    
    // Ensure the user is only modifying their own data
    if (userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized access to user data' }, { status: 403 });
    }

    // Update the API key enabled status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { api_key_enabled: enabled }
    });

    return NextResponse.json({
      apiKeyEnabled: updatedUser.api_key_enabled
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
