import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

export function ogCard(title: string, subtitle: string) {
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
        <div style={{ fontSize: 64, marginTop: 24, lineHeight: 1.08 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 28, color: '#d4af77', lineHeight: 1.3 }}>{subtitle}</div>
      </div>
    ),
    { ...ogSize }
  );
}
