import React, { useState, useEffect } from "react";
import { useRating } from "../context/RatingContext.tsx";

const StarRating = ({ movieId }) => {
    const { rateMovie, getUserRating } = useRating();
    const [userRating, setUserRating] = useState(0);
  
    useEffect(() => {
      const fetch = async () => {
        const rating = await getUserRating(movieId);
        if (rating) setUserRating(rating);
      };
      fetch();
    }, [movieId]);
  
    const handleRate = async (value) => {
      setUserRating(value);
      await rateMovie(movieId, value);
    };
  
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => handleRate(i)}>
            <span className={i <= userRating ? 'text-yellow-400' : 'text-gray-400'}>★</span>
          </button>
        ))}
      </div>
    );
  };
  