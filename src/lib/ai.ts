export interface AIRequest {
  moduleId: string;
  prompt: string;
  input: string;
  params?: Record<string, string>;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI调用失败');
  }

  return response.json();
}

export function buildPrompt(
  template: string,
  params: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}
