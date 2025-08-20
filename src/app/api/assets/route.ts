import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import Asset from '@/models/Asset';
import { authOptions } from '../auth/[...nextauth]/route';
import { IAsset } from '@/models/Asset';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(request.url);
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'desc' ? -1 : 1;

    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const dateField = url.searchParams.get('dateField') || 'createdAt';

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = startDate || endDate ? { [dateField]: dateFilter } : {};

    const assets = await Asset.find(query)
      .sort({ [sortField]: sortOrder })
      .select('-__v')
      .lean()
      .exec();

    const stats = {
      total: assets.length,
      inUse: assets.filter(a => a.status === 'IN_USE').length,
      available: assets.filter(a => a.status === 'AVAILABLE').length,
      broken: assets.filter(a => a.status === 'BROKEN').length,
      maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
    };

    return NextResponse.json({ assets, stats });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    const asset = await Asset.create({
      code: data.code,
      name: data.name,
      type: data.type,
      status: data.status,
      purchaseDate: new Date(data.purchaseDate),
      description: data.description || '',
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




