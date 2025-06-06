import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.tsx";
import { Link } from "react-router-dom";

interface Actor {
  id: number;
  name: string;
  profile_path?: string;
}

const FavoriteActorsPage: React.FC = () => {
  const { user } = useAuth();
  const [favoriteActors, setFavoriteActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError("You need to be logged in to view favorites.");
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const userRef = doc(db, "Favorites", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setFavoriteActors(docSnap.data().actors || []);
        } else {
          setFavoriteActors([]);
        }
      } catch (error) {
        console.error("Error fetching favorite actors:", error);
        setError("Failed to load favorite actors.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (loading) {
    return <div className="text-center text-gray-400">Loading favorites...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (favoriteActors.length === 0) {
    return <div className="text-center text-gray-400">No favorite actors yet.</div>;
  }

  return (
    <div className="container mx-auto px-6 pt-20 py-10 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl pt-5 font-bold mb-6">Favorite Actors</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {favoriteActors.map((actor) => (
          <div key={actor.id} className="text-center">
            <Link to={`/actor/${actor.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                alt={actor.name}
                className="w-40 h-56 object-cover rounded-lg shadow-lg transition-transform transform hover:scale-105"
              />
              <p className="mt-2 text-lg">{actor.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteActorsPage;
