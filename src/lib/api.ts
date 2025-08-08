export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE = '/api';

function getAccessToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string>; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;

  const fetchHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      (fetchHeaders as any)['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      if (err?.error) errorMessage = err.error;
    } catch {}
    throw new Error(errorMessage);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) localStorage.setItem('access_token', accessToken);
  else localStorage.removeItem('access_token');
  if (refreshToken !== undefined) {
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    else localStorage.removeItem('refresh_token');
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem('refresh_token');
  } catch {
    return null;
  }
}


