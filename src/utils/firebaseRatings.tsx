import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface UserRating {
  userId: string;
  movieId: number;
  rating: number;
}

const getUserRatings = async (userId: string): Promise<Record<number, number>> => {
  try {
    const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
    const ratings: Record<number, number> = {};

    ratingsSnapshot.forEach(doc => {
      const data = doc.data() as UserRating;
      if (data.userId === userId) {
        ratings[data.movieId] = data.rating;
      }
    });

    return ratings;
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return {};
  }
};

interface UserRatingsProps {
  userId: string;
}

const UserRatings: React.FC<UserRatingsProps> = ({ userId }) => {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      const userRatings = await getUserRatings(userId);
      setRatings(userRatings);
      setLoading(false);
    };

    fetchRatings();
  }, [userId]);

  if (loading) return <p>Loading ratings...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Ratings</h2>
      {Object.entries(ratings).length === 0 ? (
        <p>No ratings found.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(ratings).map(([movieId, rating]) => (
            <li key={movieId}>
              Movie ID: {movieId} — Rating: {rating}/5
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default getUserRatings;

