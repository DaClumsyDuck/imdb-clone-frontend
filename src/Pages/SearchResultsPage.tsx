import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MovieCard from "../components/MovieCard.tsx";
import { useRatingContext } from '../context/RatingContext.tsx';

type Movie = {
  genre_names: unknown;
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  genre_ids?: number[];
};

type Actor = {
  id: number;
  name: string;
  profile_path?: string;
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const year = searchParams.get("year") || "";
  const genre = searchParams.get("genres") || "";
  const actorName = searchParams.get("actor") || "";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [actor, setActor] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchRatingsForMovies } = useRatingContext();

  const apiKey = "621fe1fbfc8a8166a4336d9410f36ac6";

  const location = useLocation();


  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get("query") || "";
        const year = queryParams.get("year") || "";
        const genre = queryParams.get("genres") || "";
        const actorName = queryParams.get("actor") || "";

        let movieData: Movie[] = [];

        if (query && !year && !genre) {
          // Only query -> use search/movie
          const movieRes = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
          );
          const resJson = await movieRes.json();
          movieData = resJson.results || [];
        } else {
          // Filters or query+filters -> use discover/movie
          let discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&include_adult=false&page=1`;

          if (year) discoverUrl += `&primary_release_year=${year}`;
          if (genre) discoverUrl += `&with_genres=${genre}`;
          if (query) discoverUrl += `&with_keywords=${encodeURIComponent(query)}`;

          const movieRes = await fetch(discoverUrl);
          const resJson = await movieRes.json();
          movieData = resJson.results || [];
        }

        setMovies(movieData);

        if (actorName) {
          const actorRes = await fetch(
            `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`
          );
          const actorData = await actorRes.json();
          setActor(actorData.results || []);
        } else {
          setActor([]);
        }
      } catch (err) {
        console.error("Error loading search results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);

  useEffect(() => {
    if (movies?.length) {
      const ids = movies.map((m) => m.id.toString());
      fetchRatingsForMovies(ids);
    }
  }, [movies]);


  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
        Search Results {query && `for "${query}"`}
      </h1>

      {/* Show Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
        </div>
      )}

      {!loading && movies.length === 0 && actor.length === 0 && (
        <p className="text-gray-400 text-center text-lg">No results found.</p>
      )}

      {/* Movies Section */}
      {!loading && movies.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mt-6 mb-4">
            Movies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <Link
                to={`/movie/${movie.id}`}
                key={movie.id}
                className="block transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <MovieCard
                  movieId={movie.id}
                  title={movie.title}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : "/placeholder.jpg"
                  }
                  year={movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                  genre={Array.isArray(movie.genre_names) ? movie.genre_names : []}
                />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Actors Section */}
      {!loading && actor.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mt-8 mb-4">
            Actors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {actor.map((actor) => (
              <Link
                to={`/actor/${actor.id}`}
                key={actor.id}
                className="block transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                        : "/placeholder.jpg"
                    }
                    alt={actor.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {actor.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
