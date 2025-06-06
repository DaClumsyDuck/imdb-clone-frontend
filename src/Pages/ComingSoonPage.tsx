import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Movie {
  id: number;
  poster_path: string;
  title: string;
  release_date: string;
}

interface TVShow {
  id: number;
  poster_path: string;
  name: string;
  first_air_date: string;
}

const ComingSoonPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=621fe1fbfc8a8166a4336d9410f36ac6&language=en-US&page=1`);
      const showResponse = await axios.get(`https://api.themoviedb.org/3/tv/on_the_air?api_key=621fe1fbfc8a8166a4336d9410f36ac6&language=en-US&page=1`);
      
      setMovies(movieResponse.data.results);
      setShows(showResponse.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigate = (type: string, id: number) => {
    navigate(`/${type}/${id}`);
  };

  if (loading) return <div className="text-center mt-20 text-2xl">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Coming Soon</h1>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Movies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="cursor-pointer" onClick={() => handleNavigate('movie', movie.id)}>
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-xl" />
              <h3 className="text-lg mt-2">{movie.title}</h3>
              <p className="text-gray-400">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">TV Shows</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shows.map((show) => (
            <div key={show.id} className="cursor-pointer" onClick={() => handleNavigate('tv', show.id)}>
              <img src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} alt={show.name} className="rounded-xl" />
              <h3 className="text-lg mt-2">{show.name}</h3>
              <p className="text-gray-400">{show.first_air_date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ComingSoonPage;
