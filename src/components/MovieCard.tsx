import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import RatingPopup from "./RatingPopup.tsx";
import { useRatingContext } from "../context/RatingContext.tsx";

type Props = {
  movieId: number;
  title: string;
  image: string;
  year: string;
  genre: string[];
  tmdbRating?: number;
};

const MovieCard: React.FC<Props> = ({ 
  movieId, 
  title, 
  image, 
  year, 
  genre,
  tmdbRating 
}) => {
  const navigate = useNavigate();
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  const { hasRated, rateMovie, ratings } = useRatingContext();
  const rated = hasRated(movieId.toString());
  const userRating = ratings[movieId.toString()];
  
  // Display user rating if exists, otherwise show TMDB rating
  const displayRating = rated ? userRating : tmdbRating;
  const ratingText = displayRating ? displayRating.toFixed(1) : "N/A";

  const handleCardClick = () => {
    if (!showRatingPopup) {
      navigate(`/movie/${movieId}`);
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRatingPopup(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="block bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      >
        <div className="w-full aspect-[2/3] bg-gray-700">
          <img
            src={image || "https://via.placeholder.com/500x750?text=No+Image"}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
        <h3 className="text-lg font-semibold mb-1 text-black dark:text-white truncate">{title}</h3>
          <div className="flex items-center justify-between text-yellow-400 text-sm mb-1">
            <span 
              title={rated ? 
                `Your rating: ${userRating.toFixed(1)} (TMDB: ${tmdbRating?.toFixed(1) || 'N/A'})` : 
                `TMDB Rating: ${tmdbRating?.toFixed(1) || 'N/A'}`
              }
              className="flex items-center"
            >
              <Star className="w-3 h-3 mr-1" />
              {ratingText}
            </span>
            <Star
              onClick={handleStarClick}
              className={`w-5 h-5 cursor-pointer ${
                rated ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
              }`}
              aria-label={rated ? "Change your rating" : "Rate this movie"}
            />
          </div>
          <div className="text-gray-400 text-xs mb-2">{year}</div>
          <div className="flex flex-wrap gap-1">
            {genre.slice(0, 2).map((g, index) => (
              <span
                key={index}
                className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <RatingPopup
        isOpen={showRatingPopup}
        onClose={() => setShowRatingPopup(false)}
        onRate={(rating) => {
          rateMovie(movieId.toString(), rating);
          setShowRatingPopup(false);
        }}
        movieTitle={title}
        currentRating={rated ? ratings[movieId.toString()] : 0}
      />
    </>
  );
};

export default MovieCard;