import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-user-token');

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userStr = request.headers.get('x-user-data');

  if (!userStr) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userStr);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
