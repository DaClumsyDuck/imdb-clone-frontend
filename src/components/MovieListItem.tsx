// src/components/MovieListItem.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

type Props = {
  movieId: number;
  title: string;
  image: string;
  description: string;
  year: string;
  tmdbRating?: number;
};

const MovieListItem: React.FC<Props> = ({
  movieId,
  title,
  image,
  description,
  year,
  tmdbRating,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
      onClick={handleClick}
    >
      <img
        src={image || "https://via.placeholder.com/80x120?text=No+Image"}
        alt={title}
        className="w-16 h-24 object-cover rounded-sm"
      />

      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-black dark:text-white truncate">
            {title}
          </h3>
          <span className="flex items-center text-yellow-500 text-sm">
            <Star className="w-4 h-4 mr-1" />
            {tmdbRating?.toFixed(1) ?? "N/A"}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {description || "No description available."}
        </p>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Year: {year}
        </div>
      </div>
    </div>
  );
};

export default MovieListItem;
