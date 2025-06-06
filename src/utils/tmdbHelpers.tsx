// src/utils/tmdbHelpers.tsx

const TMDB_API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  genre_ids: number[];
  vote_average: number;
  release_date: string;
}

export const fetchMovieGenres = async (movieId: number): Promise<number[]> => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    return (data.genres || []).map((genre: Genre) => genre.id);
  } catch (error) {
    console.error("Failed to fetch movie genres:", error);
    return [];
  }
};

export const fetchPopularByGenres = async (
  genreIds: number[],
  page: number = 1
): Promise<Movie[]> => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds.join(
        ","
      )}&sort_by=popularity.desc&page=${page}`
    );
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch popular movies by genres:", error);
    return [];
  }
};
