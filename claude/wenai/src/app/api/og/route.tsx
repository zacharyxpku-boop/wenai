import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 动态分享卡生成：/api/og?title=xxx&excerpt=xxx&module=xxx
// 用于微信分享预览图、Twitter/OG meta、站内分享卡
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'wenai · 跨境电商 AI 工作台').slice(0, 40);
  const excerpt = (searchParams.get('excerpt') || '19 个 AI 模块 · 让跨境电商团队少做 70% 重复劳动').slice(0, 140);
  const moduleLabel = searchParams.get('module') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: brand + module tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: '#c8975a',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: '#0f0f1e',
              }}
            >
              W
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>wenai</span>
              <span style={{ fontSize: 14, color: '#888', marginTop: 2 }}>
                跨境电商 AI 工作台
              </span>
            </div>
          </div>
          {moduleLabel && (
            <div
              style={{
                padding: '8px 20px',
                border: '1px solid #c8975a',
                borderRadius: 999,
                fontSize: 18,
                color: '#c8975a',
                display: 'flex',
              }}
            >
              {moduleLabel}
            </div>
          )}
        </div>

        {/* Middle: title + excerpt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.5,
              color: '#c0c0c8',
              maxWidth: 900,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {excerpt}
          </div>
        </div>

        {/* Bottom: invite hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 24,
            borderTop: '1px solid #2a2a3e',
          }}
        >
          <div style={{ fontSize: 18, color: '#888' }}>
            wenai-one.vercel.app
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#c8975a',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            /invite?code=demo · 7 天免费体验 →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
