import { NextRequest, NextResponse } from 'next/server';
import { deleteCallMemories, listCallMemories, setAdvisorMemory } from '@/lib/call-memory';
import { memoryEnabled } from '@/lib/call-memory-text';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const notes = await listCallMemories(user.id, 20);
  return NextResponse.json({
    enabled: memoryEnabled(user.advisor_memory_enabled),
    notes: notes.map((note) => ({
      id: note.id,
      createdAt: note.createdAt,
      topics: note.topics,
      questions: note.questions,
      advice: note.advice,
      mood: note.mood,
      summary: note.summary,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Choix invalide' }, { status: 400 });
  }
  const ok = await setAdvisorMemory(user.id, body.enabled);
  if (!ok) return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 503 });
  return NextResponse.json({ enabled: body.enabled });
}

export async function DELETE() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const ok = await deleteCallMemories(user.id);
  if (!ok) return NextResponse.json({ error: 'Effacement impossible' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
