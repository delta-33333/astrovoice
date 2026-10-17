import { ImageResponse } from 'next/og';
import { ogContentType, ogSize } from './og-card';

export const coupleOgSize = ogSize;
export const coupleOgContentType = ogContentType;

/** Image de partage : initiales et score seulement. */
export function coupleOg(initialA: string, initialB: string, score: number | null) {
  const title = `${initialA.slice(0, 2)} · ${initialB.slice(0, 2)}`;
  const subtitle = score === null ? 'Callastral' : String(score);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: '#0c1018',
          color: '#f5f0e6',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#d4af77' }}>CALLASTRAL</div>
        <div style={{ fontSize: 84, marginTop: 28, lineHeight: 1 }}>{title}</div>
        <div style={{ fontSize: 42, marginTop: 24, color: '#d4af77' }}>{subtitle}</div>
      </div>
    ),
    { ...ogSize }
  );
}
