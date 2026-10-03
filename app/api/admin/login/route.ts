import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, openAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const result = await checkAdminPassword(email, password);
  if (result === 'disabled') {
    return NextResponse.json({ error: 'L’administration est désactivée.' }, { status: 503 });
  }
  if (result !== 'ok') {
    return NextResponse.json({ error: 'Identifiants refusés.' }, { status: 401 });
  }
  await openAdminSession();
  return NextResponse.json({ ok: true });
}
