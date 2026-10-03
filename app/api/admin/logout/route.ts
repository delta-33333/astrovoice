import { NextRequest, NextResponse } from 'next/server';
import { closeAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  await closeAdminSession();
  return NextResponse.redirect(new URL('/admin/login', request.url), 303);
}
