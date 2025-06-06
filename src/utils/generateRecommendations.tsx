import { fetchMovieGenres, fetchPopularByGenres } from "./tmdbHelpers.tsx";

interface GenerateRecommendationsProps {
  userWatchlist: number[];
  userRatings: Record<number, number>; 
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  genre_ids: number[];
  vote_average: number;
  release_date: string;
}

export const generateRecommendations = async ({
  userWatchlist,
  userRatings,
}: GenerateRecommendationsProps): Promise<Movie[]> => {
  const seenMovieIds = new Set([
    ...userWatchlist,
    ...Object.keys(userRatings).map(Number),
  ]);

  const topRatedIds = Object.entries(userRatings)
    .filter(([_, rating]) => rating >= 7)
    .map(([movieId]) => Number(movieId));

  const baseMovieIds = [...userWatchlist, ...topRatedIds];
  const genreSet = new Set<number>();

  for (const movieId of baseMovieIds) {
    const genres = await fetchMovieGenres(movieId);
    genres.forEach((genreId) => genreSet.add(genreId));
  }

  const genreList = Array.from(genreSet);
  const popularMovies = await fetchPopularByGenres(genreList);

  return popularMovies.filter((movie) => !seenMovieIds.has(movie.id));
};
