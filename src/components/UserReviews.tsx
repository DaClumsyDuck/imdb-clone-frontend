import React, { useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Review {
  id: string;
  author: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface UserReviewsProps {
  reviews: Review[];
}

const UserReviews: React.FC<UserReviewsProps> = ({ reviews }) => {
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">User Reviews</h2>

      {reviews && reviews.length > 0 ? (
        <div className="relative">
          {/* Left Scroll Button */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all z-10"
            onClick={() => {
              reviewsRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
          >
            <FaChevronLeft className="text-white text-lg" />
          </button>

          <div
            ref={reviewsRef}
            className="overflow-x-auto flex space-x-4 p-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-80 bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 snap-center flex flex-col"
              >
                {/* Reviewer Info */}
                <div className="flex items-center space-x-3 mb-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="w-12 h-12 rounded-full border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-bold">
                      {review.author.charAt(0)}
                    </div>
                  )}
                  <div className="w-48 truncate">
                    <h3 className="text-lg font-semibold truncate">{review.author}</h3>
                    {review.rating !== undefined && (
                      <p className="text-yellow-400 text-sm font-medium">⭐ {review.rating}/10</p>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <p className={`text-gray-300 text-sm leading-relaxed ${expanded[review.id] ? '' : 'line-clamp-4'}`}>
                  {review.content}
                </p>
                <button
                  className="text-blue-400 mt-2 text-sm self-start hover:underline"
                  onClick={() => toggleExpand(review.id)}
                >
                  {expanded[review.id] ? 'Show Less' : 'Read More'}
                </button>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all z-10"
            onClick={() => {
              reviewsRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            <FaChevronRight className="text-white text-lg" />
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-lg">No reviews available</p>
      )}
    </section>
  );
};

export default UserReviews;
