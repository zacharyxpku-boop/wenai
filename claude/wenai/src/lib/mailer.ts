/**
 * 极简邮件发送适配 · Resend / SendGrid / 本地预检 三档自动选
 *
 * 选择优先级:
 *   1. RESEND_API_KEY 存在 → 走 Resend API (https://resend.com)
 *   2. SENDGRID_API_KEY 存在 → 走 SendGrid API
 *   3. 都没 → 返回本地预检成功，不发送外部邮件
 *
 * from 默认 'wenai <noreply@wenai-one.vercel.app>',可被 EMAIL_FROM 覆盖
 *
 * 不接队列 / 不重试 (cron 是幂等的, 失败下次再发)
 */

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  ok: boolean;
  provider: 'resend' | 'sendgrid' | 'log';
  error?: string;
  id?: string;
}

const FROM = process.env.EMAIL_FROM || 'wenai <noreply@wenai-one.vercel.app>';

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const { to, subject, html, text } = args;

  // 1. Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: [to],
          subject,
          html,
          text: text || stripHtml(html),
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, provider: 'resend', error: `${res.status}: ${errText.slice(0, 200)}` };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: true, provider: 'resend', id: data?.id };
    } catch (e) {
      return { ok: false, provider: 'resend', error: e instanceof Error ? e.message : 'fetch fail' };
    }
  }

  // 2. SendGrid (v3 单消息)
  const sgKey = process.env.SENDGRID_API_KEY;
  if (sgKey) {
    try {
      const fromMatch = FROM.match(/^(.+?) <(.+)>$/);
      const fromName = fromMatch?.[1] || 'wenai';
      const fromEmail = fromMatch?.[2] || FROM;
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sgKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: fromName },
          subject,
          content: [
            { type: 'text/plain', value: text || stripHtml(html) },
            { type: 'text/html', value: html },
          ],
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, provider: 'sendgrid', error: `${res.status}: ${errText.slice(0, 200)}` };
      }
      return { ok: true, provider: 'sendgrid' };
    } catch (e) {
      return { ok: false, provider: 'sendgrid', error: e instanceof Error ? e.message : 'fetch fail' };
    }
  }

  return { ok: true, provider: 'log' };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
