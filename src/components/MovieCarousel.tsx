import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import MovieCard from "./MovieCard.tsx";
import MovieListItem from "./MovieListItem.tsx";

type Movie = {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  genre: string[];
};

type Props = {
  movies: Movie[];
  viewMode?: "grid" | "list";
};

const MovieCarousel: React.FC<Props> = ({ movies, viewMode = "grid" }) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleMovies = 4;

  const nextSlide = () => {
    setStartIndex((prev) =>
      prev + visibleMovies >= movies.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setStartIndex((prev) =>
      prev === 0 ? Math.max(0, movies.length - visibleMovies) : prev - 1
    );
  };

  // List view mode
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {movies.map((movie) => (
          <MovieListItem
            key={movie.id}
            movieId={movie.id}
            title={movie.title}
            image={movie.image}
            description={""}
            year={movie.year.toString()}
            tmdbRating={movie.rating}
          />
        ))}
      </div>
    );
  }

  // Carousel view (default)
  return (
    <div className="relative group">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${startIndex * (100 / visibleMovies)}%)`,
          }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 p-2"
            >
              <MovieCard
                movieId={movie.id}
                title={movie.title}
                image={movie.image}
                year={movie.year.toString()}
                genre={movie.genre}
                tmdbRating={movie.rating}
              />
            </div>
          ))}
        </div>
      </div>

      {movies.length > visibleMovies && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default MovieCarousel;
