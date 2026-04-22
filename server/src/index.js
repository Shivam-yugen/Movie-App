import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import dns from 'node:dns';
import { z } from 'zod';

import { prisma } from './prisma.js';
import { requireAuth, signAccessToken } from './auth.js';
import { hashPassword, verifyPassword } from './password.js';
import { getTmdbImageUrl, tmdbFetch } from './tmdb.js';

dns.setDefaultResultOrder('ipv4first');

const {
  PORT = '4000',
  JWT_SECRET,
  TMDB_API_KEY,
  TMDB_BASE_URL = 'https://api.themoviedb.org/3',
} = process.env;

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('Missing JWT_SECRET in server env');
  process.exit(1);
}
if (!TMDB_API_KEY) {
  // eslint-disable-next-line no-console
  console.error('Missing TMDB_API_KEY in server env');
  process.exit(1);
}

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

app.post('/auth/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body' });

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'email_taken' });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const token = signAccessToken({ userId: user.id }, { jwtSecret: JWT_SECRET });
  return res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

app.post('/auth/login', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body' });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const token = signAccessToken({ userId: user.id }, { jwtSecret: JWT_SECRET });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

app.get('/me', requireAuth({ jwtSecret: JWT_SECRET }), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'not_found' });
  return res.json({ id: user.id, email: user.email });
});

app.get('/movies/home', async (_req, res) => {
  try {
    const [trending, topRated, nowPlaying] = await Promise.all([
      tmdbFetch('/trending/movie/week', { tmdbBaseUrl: TMDB_BASE_URL, tmdbApiKey: TMDB_API_KEY }),
      tmdbFetch('/movie/top_rated', {
        tmdbBaseUrl: TMDB_BASE_URL,
        tmdbApiKey: TMDB_API_KEY,
        params: { page: 1 },
      }),
      tmdbFetch('/movie/now_playing', {
        tmdbBaseUrl: TMDB_BASE_URL,
        tmdbApiKey: TMDB_API_KEY,
        params: { page: 1 },
      }),
    ]);

    const mapItem = (m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      voteAverage: m.vote_average,
      releaseDate: m.release_date,
      posterUrl: getTmdbImageUrl(m.poster_path, { size: 'w500' }),
      backdropUrl: getTmdbImageUrl(m.backdrop_path, { size: 'w780' }),
    });

    return res.json({
      trending: trending.results?.map(mapItem) ?? [],
      topRated: topRated.results?.map(mapItem) ?? [],
      nowPlaying: nowPlaying.results?.map(mapItem) ?? [],
    });
  } catch (e) {
    return res.status(502).json({ error: 'tmdb_failed' });
  }
});

app.get('/movies/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json({ results: [] });

  try {
    const data = await tmdbFetch('/search/movie', {
      tmdbBaseUrl: TMDB_BASE_URL,
      tmdbApiKey: TMDB_API_KEY,
      params: { query: q, include_adult: false, page: 1 },
    });

    return res.json({
      results:
        data.results?.map((m) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          voteAverage: m.vote_average,
          releaseDate: m.release_date,
          posterUrl: getTmdbImageUrl(m.poster_path, { size: 'w500' }),
          backdropUrl: getTmdbImageUrl(m.backdrop_path, { size: 'w780' }),
        })) ?? [],
    });
  } catch {
    return res.status(502).json({ error: 'tmdb_failed' });
  }
});

app.get('/movies/:tmdbId', async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  if (!Number.isFinite(tmdbId)) return res.status(400).json({ error: 'invalid_id' });

  try {
    const data = await tmdbFetch(`/movie/${tmdbId}`, {
      tmdbBaseUrl: TMDB_BASE_URL,
      tmdbApiKey: TMDB_API_KEY,
      params: { append_to_response: 'videos,credits,recommendations' },
    });

    return res.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      voteAverage: data.vote_average,
      releaseDate: data.release_date,
      runtime: data.runtime,
      genres: data.genres?.map((g) => ({ id: g.id, name: g.name })) ?? [],
      posterUrl: getTmdbImageUrl(data.poster_path, { size: 'w500' }),
      backdropUrl: getTmdbImageUrl(data.backdrop_path, { size: 'w780' }),
      trailerKey:
        data.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key ??
        null,
      cast:
        data.credits?.cast?.slice(0, 12).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profileUrl: getTmdbImageUrl(c.profile_path, { size: 'w185' }),
        })) ?? [],
      recommendations:
        data.recommendations?.results?.slice(0, 20).map((m) => ({
          id: m.id,
          title: m.title,
          posterUrl: getTmdbImageUrl(m.poster_path, { size: 'w500' }),
          backdropUrl: getTmdbImageUrl(m.backdrop_path, { size: 'w780' }),
          voteAverage: m.vote_average,
          releaseDate: m.release_date,
        })) ?? [],
    });
  } catch {
    return res.status(502).json({ error: 'tmdb_failed' });
  }
});

app.get('/lists/my-list', requireAuth({ jwtSecret: JWT_SECRET }), async (req, res) => {
  const items = await prisma.movieListItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ items });
});

app.post('/lists/my-list', requireAuth({ jwtSecret: JWT_SECRET }), async (req, res) => {
  const bodySchema = z.object({
    tmdbId: z.number().int(),
    title: z.string().min(1),
    posterUrl: z.string().nullable().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_body' });

  const item = await prisma.movieListItem.upsert({
    where: { userId_tmdbId: { userId: req.userId, tmdbId: parsed.data.tmdbId } },
    update: { title: parsed.data.title, posterUrl: parsed.data.posterUrl ?? null },
    create: {
      userId: req.userId,
      tmdbId: parsed.data.tmdbId,
      title: parsed.data.title,
      posterUrl: parsed.data.posterUrl ?? null,
    },
  });
  return res.status(201).json({ item });
});

app.delete('/lists/my-list/:tmdbId', requireAuth({ jwtSecret: JWT_SECRET }), async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  if (!Number.isFinite(tmdbId)) return res.status(400).json({ error: 'invalid_id' });

  await prisma.movieListItem.deleteMany({ where: { userId: req.userId, tmdbId } });
  return res.json({ ok: true });
});

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});

