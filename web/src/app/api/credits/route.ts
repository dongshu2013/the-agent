import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/firebase-admin';
import { TransactionType } from '@/lib/constants';

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

    // Parse query parameters for filtering
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const model = url.searchParams.get('model');
    const transType = url.searchParams.get('transType') as TransactionType | null;

    // Build where clause with filters
    const whereClause: any = {
      user_id: uid
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      whereClause.created_at = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.created_at = {
        lte: new Date(endDate)
      };
    }

    // Add model filter if provided
    if (model) {
      whereClause.model = model;
    }

    // Add transaction type filter if provided
    if (transType) {
      whereClause.trans_type = transType;
    }

    // Get credit transactions for the user with filters
    const credits = await prisma.credits.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get unique models and transaction types for filter options
    const uniqueModels = await prisma.credits.findMany({
      where: { user_id: uid, model: { not: null } },
      select: { model: true },
      distinct: ['model']
    });

    const models = uniqueModels
      .map(item => item.model)
      .filter(model => model !== null) as string[];

    return NextResponse.json({ 
      credits,
      filters: {
        models,
        transTypes: Object.values(TransactionType)
      }
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits data' },
      { status: 500 }
    );
  }
}
