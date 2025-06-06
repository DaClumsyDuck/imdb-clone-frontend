import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  movieTitle: string;
  currentRating?: number;
}

const RatingPopup: React.FC<RatingPopupProps> = ({
  isOpen,
  onClose,
  onRate,
  movieTitle,
  currentRating = 0,
}) => {
  const [selectedRating, setSelectedRating] = useState(currentRating);

  useEffect(() => {
    if (isOpen) setSelectedRating(currentRating);
  }, [isOpen, currentRating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold text-center">
          Rate <span className="text-yellow-500">{movieTitle}</span>
        </h2>
        <div className="flex justify-center mt-4 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                selectedRating >= star ? "text-yellow-500" : "text-gray-400"
              }`}
              onClick={() => {
                setSelectedRating(star);
                onRate(star);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
