function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='));
  return match ? match.split('=')[1] : '';
}

async function ensureCsrfCookie(): Promise<void> {
  if (getCsrfToken()) return;
  // Bootstrap: hit the safe GET endpoint to set the cookie
  const res = await fetch('/api/csrf', {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to initialize CSRF token');
  }
}

const API_VERSION = '/v1';

function normalizeApiUrl(url: string): string {
  if (url.startsWith('/api/') && !url.startsWith('/api/v')) {
    return `/api${API_VERSION}${url.slice(4)}`;
  }
  return url;
}

export async function csrfFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  await ensureCsrfCookie();

  const headers = new Headers(init?.headers);
  const csrfToken = getCsrfToken();
  if (csrfToken && !headers.has('x-csrf-token')) {
    headers.set('x-csrf-token', csrfToken);
  }
  const normalizedUrl = normalizeApiUrl(url);
  return fetch(normalizedUrl, { ...init, headers, credentials: 'include' });
}
