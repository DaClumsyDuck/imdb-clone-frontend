import React, { useEffect, useState } from "react";
import MovieCarousel from "./MovieCarousel.tsx";
import { generateRecommendations } from "../utils/generateRecommendations.tsx";
import useUserMovieData from "../hooks/useUserMoviedata.tsx";
import { useAuth } from "../context/AuthContext.tsx"; 

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
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

const Recommendations: React.FC = () => {
  const { user } = useAuth(); 
  const { userWatchlist, userRatings } = useUserMovieData(user?.uid || "");
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.uid) return;

      setLoading(true);
      const recommendations = await generateRecommendations({
        userWatchlist: userWatchlist.map(id => Number(id)), 
        userRatings,
      });

      setRecommendedMovies(recommendations);
      setLoading(false);
    };

    fetchRecommendations();
  }, [user?.uid, userWatchlist, userRatings]);

  if (!user) return null;

  if (loading)
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        Loading recommendations...
      </div>
    );

  if (recommendedMovies.length === 0)
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        No recommendations yet. Add movies to your watchlist or rate them!
      </div>
    );

  
  const formattedMovies: CarouselMovie[] = recommendedMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    year: parseInt(movie.release_date?.split("-")[0] || "0", 10),
    rating: movie.vote_average,
    genre: [], 
  }));

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
        Recommended For You
      </h2>
      <MovieCarousel movies={formattedMovies} />
    </div>
  );
};

export default Recommendations;
