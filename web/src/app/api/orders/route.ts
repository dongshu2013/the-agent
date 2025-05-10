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

    // Get all orders for the user
    const orders = await prisma.orders.findMany({
      where: {
        user_id: uid
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders data' },
      { status: 500 }
    );
  }
}
