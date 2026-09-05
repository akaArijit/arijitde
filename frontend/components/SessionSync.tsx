'use client';

import { useEffect } from 'react';

export default function SessionSync() {
  useEffect(() => {
    // Parse cookies
    const cookies = document.cookie.split(';').reduce(
      (acc, c) => {
        const [k, v] = c.trim().split('=');
        if (k) acc[k] = decodeURIComponent(v || '');
        return acc;
      },
      {} as Record<string, string>,
    );

    // If the token cookie is absent but we have a token in localStorage, it means
    // the user chose session-only auth, closed the browser, and reopened it.
    // In this case, we clear localStorage to enforce logout.
    if (!cookies.token && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  return null;
}
