import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { authenticateRequest } from '@/lib/firebase-admin';

// Generate a random API key in UUID format for consistency with Prisma's @default(uuid())
function generateApiKey(): string {
  return crypto.randomUUID();
}

// POST /api/auth/apikey - Handles both rotate and toggle operations
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    const { isAuthenticated, uid, error } = await authenticateRequest(authHeader);
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body once
    const body = await request.json();
    const { userId, operation, enabled } = body;

    if (!userId || !operation) {
      return NextResponse.json({ error: 'User ID and operation are required' }, { status: 400 });
    }
    
    // Ensure the user is only modifying their own data
    if (userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized access to user data' }, { status: 403 });
    }

    if (operation === 'rotate') {
      // Generate a new API key in UUID format
      const newApiKey = generateApiKey();

      // Update the user's API key
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { api_key: newApiKey }
      });

      return NextResponse.json({
        apiKey: updatedUser.api_key
      });
    } else if (operation === 'toggle') {
      if (enabled === undefined) {
        return NextResponse.json({ error: 'Enabled status is required for toggle operation' }, { status: 400 });
      }

      // Update the API key enabled status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { api_key_enabled: enabled }
      });

      return NextResponse.json({
        apiKeyEnabled: updatedUser.api_key_enabled
      });
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error rotating or toggling API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
