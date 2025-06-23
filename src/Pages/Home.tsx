import React, { useEffect, useState } from "react";
import Hero from "../components/Hero.tsx";
import { List, Clock, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCarousel from "../components/MovieCarousel.tsx";
import { useViewMode } from "../context/ViewModeContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import useUserMovieData from "../hooks/useUserMoviedata.tsx";
import { generateRecommendations } from "../utils/generateRecommendations.tsx";

const TMDB_API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_GENRE_API = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`;

type Movie = {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
};

type CarouselMovie = {
  id: number;
  title: string;
  image: string;
  year: number;
  rating: number;
  genre: string[];
};

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const { viewMode } = useViewMode();

  // ⭐️ Recommendation Logic Begins
  const { user } = useAuth();
  const { userWatchlist, userRatings } = useUserMovieData(user?.uid || "");
  const [recommendedMovies, setRecommendedMovies] = useState<CarouselMovie[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.uid) return;

      setLoadingRecommendations(true);
      const recommendations = await generateRecommendations({
        userWatchlist: userWatchlist.map((id) => Number(id)),
        userRatings,
      });

      const formatted: CarouselMovie[] = recommendations.map((movie: Movie) => ({
        id: movie.id,
        title: movie.title,
        image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        year: parseInt(movie.release_date?.split("-")[0] || "0", 10),
        rating: movie.vote_average,
        genre: [], // You can optionally map this using genreMap if desired
      }));

      setRecommendedMovies(formatted);
      setLoadingRecommendations(false);
    };

    fetchRecommendations();
  }, [user?.uid, userWatchlist, userRatings]);
  // ⭐️ Recommendation Logic Ends

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(TMDB_GENRE_API);
        const data = await response.json();

        const genres: Record<number, string> = {};
        data.genres.forEach((genre: { id: number; name: string }) => {
          genres[genre.id] = genre.name;
        });

        setGenreMap(genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    const fetchMovies = async () => {
      try {
        const trendingResponse = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
        );
        const upcomingResponse = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}`
        );

        const trendingData = await trendingResponse.json();
        const upcomingData = await upcomingResponse.json();

        setTrendingMovies(trendingData.results as Movie[]);
        setUpcomingMovies(upcomingData.results as Movie[]);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
    fetchMovies();
  }, []);

  return (
    <div>
      <Hero />
      <main className="container mx-auto px-4 py-8 bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: TrendingUp, label: "Trending", path: "/movies?sort=trending", color: "bg-yellow-500" },
            { icon: Star, label: "Top Rated", path: "/top-rated", color: "bg-purple-500" },
            { icon: Clock, label: "Coming Soon", path: "/coming-soon", color: "bg-blue-500" },
            { icon: List, label: "Watchlist", path: "/watchlist", color: "bg-red-500" },
          ].map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className={`${category.color} p-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-70 transition-opacity`}
            >
              <category.icon className="w-5 h-5" />
              <span className="font-medium">{category.label}</span>
            </Link>
          ))}
        </div>

        {/* Trending */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
              Trending Now
            </h2>
            <Link to="/movies?sort=trending" className="text-yellow-500 hover:text-yellow-400">
              View All
            </Link>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading movies...</p>
          ) : (
            <MovieCarousel
              movies={trendingMovies.map((movie) => ({
                id: movie.id,
                title: movie.title,
                rating: movie.vote_average,
                image: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/500",
                year: new Date(movie.release_date).getFullYear(),
                genre: movie.genre_ids.map((id) => genreMap[id] || "Unknown Genre"),
              }))}
              viewMode={viewMode}
            />
          )}
        </section>

        {/* ⭐️ Recommendations Section */}
        {user && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500">Recommended For You</h2>
            </div>
            {loadingRecommendations ? (
              <p className="text-center text-gray-500">Loading recommendations...</p>
            ) : recommendedMovies.length === 0 ? (
              <p className="text-center text-gray-500">No recommendations yet. Add movies to your watchlist or rate them!</p>
            ) : (
              <MovieCarousel movies={recommendedMovies} viewMode={viewMode} />
            )}
          </section>
        )}

        {/* Coming Soon */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              Coming Soon
            </h2>
            <Link to="/coming-soon" className="text-yellow-500 hover:text-yellow-400">
              View All
            </Link>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading movies...</p>
          ) : (
            <MovieCarousel
              movies={upcomingMovies.map((movie) => ({
                id: movie.id,
                title: movie.title,
                rating: movie.vote_average,
                image: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "https://via.placeholder.com/500",
                year: new Date(movie.release_date).getFullYear(),
                genre: movie.genre_ids.map((id) => genreMap[id] || "Unknown Genre"),
              }))}
              viewMode={viewMode}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
