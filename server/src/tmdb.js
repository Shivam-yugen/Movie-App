export function getTmdbImageUrl(path, { size = 'w500' } = {}) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function tmdbFetch(path, { tmdbBaseUrl, tmdbApiKey, params } = {}) {
  const url = new URL(`${tmdbBaseUrl}${path}`);
  url.searchParams.set('api_key', tmdbApiKey);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`TMDB ${res.status} ${res.statusText}`);
    err.details = text;
    throw err;
  }
  return res.json();
}

