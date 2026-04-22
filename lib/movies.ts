import { api } from './api';
import { getCache, setCache } from './storage';
import type { HomeRows, MovieDetails, MovieSummary } from './types';

export async function getHomeRows({ useCache = true } = {}) {
  const cacheKey = 'homeRows:v1';
  if (useCache) {
    const cached = await getCache<HomeRows>(cacheKey);
    if (cached) return cached;
  }
  const { data } = await api.get<HomeRows>('/movies/home');
  await setCache(cacheKey, data);
  return data;
}

export async function searchMovies(q: string): Promise<MovieSummary[]> {
  const { data } = await api.get<{ results: MovieSummary[] }>('/movies/search', { params: { q } });
  return data.results ?? [];
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const { data } = await api.get<MovieDetails>(`/movies/${id}`);
  return data;
}

