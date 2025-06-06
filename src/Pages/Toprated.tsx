import { Star, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const BASE_URL = "https://api.themoviedb.org/3";

interface Movie {
  id: number;
  title: string;
  vote_average: number;
  poster_path?: string;
  release_date?: string;
  vote_count: number;
}

const Toprated = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(`${BASE_URL}/movie/top_rated`, {
          params: {
            api_key: API_KEY,
            language: "en-US",
            page: 1,
          },
        });

        setMovies(data.results.slice(0, 10)); // Fetch only top 10 movies
      } catch (err) {
        console.error("Error fetching top-rated movies:", err);
        setError("Failed to load top-rated movies.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, []);

  if (loading) return <div className="text-center text-gray-400">Loading top-rated movies...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Top Rated Movies</h1>
      </motion.div>

      {/* Movie List */}
      <div className="space-y-6">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link to={`/movie/${movie.id}`}>
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex">
                  {/* Rank */}
                  <div className="w-16 bg-yellow-500 flex items-center justify-center text-black font-bold text-xl">
                    #{index + 1}
                  </div>
                  
                  {/* Movie Poster */}
                  <div className="relative w-40 h-[150px]">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {movie.title}
                      </h2>
                      {/* Rating */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Year & Votes */}
                    <div className="text-gray-400 dark:text-gray-200 text-sm">
                      <span>{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</span>
                      <span className="mx-2">•</span>
                      <span>{movie.vote_count.toLocaleString()} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Toprated;
