export type ExternalCrmProvider = 'generic' | 'hubspot' | 'feishu';

export type ExternalCrmPayload = {
  wenaiId: string;
  externalCrmId?: string;
  externalCrmUrl?: string;
  account: Record<string, string>;
  contact: Record<string, string>;
  deal: Record<string, string>;
  sync: Record<string, string>;
};

export type ExternalCrmSyncResult = {
  ok: boolean;
  configured: boolean;
  status: 'not_configured' | 'synced' | 'failed';
  provider: ExternalCrmProvider;
  externalId?: string;
  externalUrl?: string;
  note: string;
};

function getProvider(): ExternalCrmProvider {
  const raw = (process.env.EXTERNAL_CRM_PROVIDER || 'generic').toLowerCase();
  if (raw === 'hubspot' || raw === 'feishu') return raw;
  return 'generic';
}

function getEndpoint(): string {
  return process.env.EXTERNAL_CRM_WEBHOOK_URL || '';
}

function getToken(): string {
  return process.env.EXTERNAL_CRM_TOKEN || '';
}

function buildProviderPayload(provider: ExternalCrmProvider, payload: ExternalCrmPayload) {
  if (provider === 'hubspot') {
    return {
      properties: {
        company: payload.account.name,
        domain: payload.account.domain,
        email: payload.contact.email,
        firstname: payload.contact.name,
        phone: payload.contact.phone,
        dealname: payload.deal.name,
        amount: payload.deal.amount,
        dealstage: payload.deal.stage,
        pipeline: 'default',
        wenai_id: payload.wenaiId,
        wenai_next_action: payload.deal.nextAction,
      },
      raw: payload,
    };
  }

  if (provider === 'feishu') {
    return {
      msg_type: 'interactive',
      card: {
        header: { title: { tag: 'plain_text', content: `wenai CRM 线索：${payload.account.name || payload.wenaiId}` } },
        elements: [
          { tag: 'div', text: { tag: 'lark_md', content: `**联系人**：${payload.contact.name || payload.contact.raw || '-'}\n**商机**：${payload.deal.name || '-'}\n**下一步**：${payload.deal.nextAction || '-'}` } },
        ],
      },
      raw: payload,
    };
  }

  return {
    event: 'wenai.crm.inquiry.sync',
    version: 'wenai-crm-v1',
    payload,
  };
}

export async function syncExternalCrm(payload: ExternalCrmPayload): Promise<ExternalCrmSyncResult> {
  const provider = getProvider();
  const endpoint = getEndpoint();
  const token = getToken();

  if (!endpoint) {
    return {
      ok: false,
      configured: false,
      status: 'not_configured',
      provider,
      note: 'EXTERNAL_CRM_WEBHOOK_URL 未配置，已保留为可导出的 CRM 映射记录。',
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(buildProviderPayload(provider, payload)),
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      return {
        ok: false,
        configured: true,
        status: 'failed',
        provider,
        note: `外部 CRM 返回 HTTP ${res.status}${text ? `：${text.slice(0, 180)}` : ''}`,
      };
    }

    return {
      ok: true,
      configured: true,
      status: 'synced',
      provider,
      externalId: payload.externalCrmId,
      externalUrl: payload.externalCrmUrl,
      note: `已同步到 ${provider} CRM webhook。`,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      status: 'failed',
      provider,
      note: error instanceof Error ? error.message : '外部 CRM 同步失败',
    };
  }
}
