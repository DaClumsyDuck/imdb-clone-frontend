import React, { useEffect, useState } from "react";
import { Play, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.tsx";

const TMDB_API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const TMDB_API_URL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;

interface Movie {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  overview: string;
  backdrop_path: string;
}

const Hero = () => {
  const { theme } = useTheme();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState(0);

  // Fetch trending movies from TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(TMDB_API_URL);
        const data = await response.json();
        setMovies(data.results.slice(0, 5)); // Show only top 5 trending movies
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Auto-switch movie every 8 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMovie((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (movies.length === 0) {
    return (
      <div
        className={`h-[90vh] flex items-center justify-center ${theme === "dark" ? "text-white" : "text-black"
          }`}
      >
        Loading...
      </div>
    );
  }


  const movie = movies[currentMovie];

  return (
    <div className="relative h-[90vh] pt-20 bg-gradient-to-b from-transparent to-black">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 gradient-mask"
        style={{
          backgroundImage: `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className={`max-w-2xl relative z-10 p-6 rounded-xl bg-gradient-to-r ${theme === "dark"
            ? "from-black/80 via-black/60 to-transparent"
            : "from-white/20 via-white/10 to-transparent"
          }`}>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-yellow-500 font-semibold">
                {movie.vote_average.toFixed(1)} Rating
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Calendar className="w-5 h-5 text-zinc-400" />
              <span className="text-zinc-300">{new Date(movie.release_date).toDateString()}</span>
            </div>
          </div>
          <h1 className={`text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg ${theme === "dark" ? "text-white" : "text-black"}`}>
            {movie.title}
          </h1>
          <p
            className={`text-lg mb-8 line-clamp-3 max-w-xl ${theme === "dark" ? "text-zinc-300" : "text-black"
              }`}
          >
            {movie.overview}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/movie/${movie.id}`}
              className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105 duration-300"
            >
              <Play className="w-5 h-5" />
              Watch Trailer
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="bg-zinc-900/80 backdrop-blur-md text-white px-8 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all hover:scale-105 duration-300"
            >
              More Info
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 right-4 flex gap-2">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMovie(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentMovie === index ? "bg-yellow-500 w-8" : "bg-zinc-600 w-4 hover:bg-zinc-500"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
