import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    data: {
      message: 'Alma Lifestyle API is healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    },
  });
}