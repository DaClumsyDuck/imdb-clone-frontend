import React, { useEffect } from 'react';
import { useWatchlist } from '../context/WatchListContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from 'react-router-dom';

const WatchlistPage = () => {
  const { watchlist, removeMovie, fetchWatchlist, loading } = useWatchlist();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchWatchlist();
  }, [user]);

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading your watchlist...</div>;
  }

  if (!watchlist || watchlist.length === 0) {
    return <div className="text-center mt-20 text-gray-500">Your watchlist is empty. Start adding movies now!</div>;
  }

  return (
    <div className="container pt-20 mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">Your Watchlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {watchlist.map((movie) => (
          <div key={movie.id} className="relative group">
            <Link to={`/movie/${movie.id}`} className="block">
              <img 
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                alt={movie.title} 
                className="w-full h-auto rounded-lg shadow-lg group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black to-transparent p-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{movie.title}</h3>
                  <p className="text-gray-300 text-sm">Release: {movie.release_date?.slice(0, 4)} | Rating: {movie.vote_average?.toFixed(1)}</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => removeMovie(movie.id.toString())}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;
