import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'filter-options') {
      const filterOptions = await googleSheetsService.getFilterOptions();
      return NextResponse.json(filterOptions);
    }

    // Default action: get all programs
    const programs = await googleSheetsService.getProgramsData();
    return NextResponse.json(programs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs data' },
      { status: 500 }
    );
  }
}

