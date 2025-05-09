import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = req.headers.get('authorization');
    const { isAuthenticated, uid, error } = await authenticateRequest(authHeader);

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all credit transactions for the user
    const credits = await prisma.credits.findMany({
      where: {
        user_id: uid
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits data' },
      { status: 500 }
    );
  }
}
