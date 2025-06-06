// src/context/RatingContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface RatingContextType {
  ratings: { [movieId: string]: number };
  hasRated: (movieId: string) => boolean;
  rateMovie: (movieId: string, rating: number) => void;
  fetchRatingsForMovies: (movieIds: string[]) => Promise<void>;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const RatingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ratings, setRatings] = useState<{ [movieId: string]: number }>({});

  useEffect(() => {
    const stored = localStorage.getItem("userRatings");
    if (stored) setRatings(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("userRatings", JSON.stringify(ratings));
  }, [ratings]);

  const hasRated = (movieId: string) => !!ratings[movieId];

  const rateMovie = (movieId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [movieId]: rating }));
  };

  const fetchRatingsForMovies = async (movieIds: string[]) => {
    const apiKey = "YOUR_TMDB_API_KEY"; // Replace with your TMDB API key
    const newRatings: { [movieId: string]: number } = {};

    await Promise.all(
      movieIds.map(async (id) => {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
          const data = await res.json();
          if (data.vote_average) {
            newRatings[id] = data.vote_average;
          }
        } catch (error) {
          console.error(`Error fetching rating for movie ID ${id}:`, error);
        }
      })
    );

    setRatings((prev) => ({ ...prev, ...newRatings }));
  };

  return (
    <RatingContext.Provider value={{ ratings, hasRated, rateMovie, fetchRatingsForMovies }}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRatingContext = () => {
  const context = useContext(RatingContext);
  if (!context) throw new Error("useRatingContext must be used within RatingProvider");
  return context;
};
