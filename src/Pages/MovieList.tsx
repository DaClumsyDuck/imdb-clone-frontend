import { SlidersHorizontal, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import ViewToggle from "../components/ViewToggle.tsx";
import MovieListItem from "../components/MovieListItem.tsx";
import { useViewMode } from "../context/ViewModeContext.tsx";

const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const BASE_URL = "https://api.themoviedb.org/3";

interface Movie {
  id: number;
  title: string;
  vote_average: number;
  poster_path?: string;
  release_date?: string;
}

const MovieList = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { viewMode, toggleViewMode } = useViewMode();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = search
          ? `${BASE_URL}/search/movie`
          : `${BASE_URL}/movie/popular`;

        const { data } = await axios.get(endpoint, {
          params: {
            api_key: API_KEY,
            query: search,
            language: "en-US",
            page: 1,
          },
        });

        setMovies(data.results);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search]);

  if (loading) return <div className="text-center text-gray-400">Loading movies...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {search ? `Search Results for "${search}"` : "Popular Movies"}
        </h1>
        <div className="flex gap-4 items-center">
          <ViewToggle view={viewMode} onToggle={toggleViewMode} />
          <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-xl hover:bg-gray-900 transition-colors">
            <SlidersHorizontal /> Filters
          </button>
        </div>
      </div>


      {/* No Movies Found */}
      {movies.length === 0 ? (
        <div className="text-center text-gray-400">No movies found.</div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="group">
                <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-all hover:scale-105 hover:shadow-xl">
                  <div className="relative w-full h-[400px]">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:opacity-90"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-yellow-500 font-medium">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white line-clamp-1">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {movies.map((movie) => (
              <MovieListItem
                key={movie.id}
                movieId={movie.id}
                title={movie.title}
                image={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                description={""}
                year={movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                tmdbRating={movie.vote_average}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
};

export default MovieList;
