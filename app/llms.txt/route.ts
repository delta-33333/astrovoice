import { buildLlmsText } from '@/lib/llms-document';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export function GET() {
  const body = buildLlmsText(appBaseUrl());
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
