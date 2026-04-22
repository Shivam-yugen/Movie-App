export type User = {
  id: string;
  email: string;
};

export type MovieSummary = {
  id: number;
  title: string;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
};

export type HomeRows = {
  trending: MovieSummary[];
  topRated: MovieSummary[];
  nowPlaying: MovieSummary[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profileUrl?: string | null;
};

export type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  voteAverage: number;
  releaseDate: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerKey?: string | null;
  cast: CastMember[];
  recommendations: MovieSummary[];
};

export type MyListItem = {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  createdAt: string;
};

