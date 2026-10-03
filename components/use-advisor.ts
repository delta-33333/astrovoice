'use client';

import { useEffect, useState } from 'react';
import type { PublicAdvisor } from '@/lib/types';

export function useAdvisor(id: string | null) {
  const [advisor, setAdvisor] = useState<PublicAdvisor | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'error'>('idle');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus('loading');

    fetch(`/api/advisors/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 404) {
          setStatus('missing');
          return;
        }
        if (!response.ok) {
          setStatus('error');
          return;
        }
        const body = (await response.json()) as { advisor?: PublicAdvisor };
        if (!body.advisor) {
          setStatus('missing');
          return;
        }
        setAdvisor(body.advisor);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { advisor, status };
}
