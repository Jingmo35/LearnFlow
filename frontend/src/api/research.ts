import type { HealthResponse, ResearchRequest, ResearchResponse } from '../types/research';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) {
    throw new Error(`健康检查失败（${response.status}）`);
  }
  return response.json() as Promise<HealthResponse>;
}

export async function fetchResearch(
  query: string,
  options: Partial<Omit<ResearchRequest, 'query'>> = {}
): Promise<ResearchResponse> {
  const payload: ResearchRequest = {
    query,
    mode: options.mode ?? 'topic',
    userLevel: options.userLevel ?? 'beginner',
    timeBudgetHours: options.timeBudgetHours ?? 6
  };

  const response = await fetch(`${API_BASE}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let detail = `请求失败（${response.status}）`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  return response.json() as Promise<ResearchResponse>;
}
