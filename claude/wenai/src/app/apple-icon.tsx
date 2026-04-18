import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0e0e11 0%, #1e1e23 100%)',
          color: '#c8975a',
          fontSize: 128,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          borderRadius: 36,
        }}
      >
        W
      </div>
    ),
    { ...size }
  );
}
