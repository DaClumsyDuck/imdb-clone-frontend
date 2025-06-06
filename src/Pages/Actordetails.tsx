import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Instagram, Star, Twitter, Heart } from "lucide-react";
import axios from "axios";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.tsx";

const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const BASE_URL = "https://api.themoviedb.org/3";

interface ActorDetails {
  id: number;
  name: string;
  profile_path?: string;
  popularity: number;
  birthday?: string;
  place_of_birth?: string;
  biography?: string;
  external_ids?: {
    instagram_id?: string;
    twitter_id?: string;
  };
  movie_credits?: {
    cast: Movie[];
  };
}

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  vote_average: number;
}

const Actordetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const actorId = id ? parseInt(id, 10) : null; // Ensure id is a number
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [knownFor, setKnownFor] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!actorId) return;
    const fetchActorDetails = async () => {
      try {
        const { data } = await axios.get<ActorDetails>(`${BASE_URL}/person/${actorId}`, {
          params: {
            api_key: API_KEY,
            append_to_response: "movie_credits,external_ids",
          },
        });
        setActor(data);
        setKnownFor(data.movie_credits?.cast.slice(0, 6) || []);
      } catch (error) {
        console.error("Error fetching actor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActorDetails();
  }, [actorId]);

  useEffect(() => {
    if (!user || actorId === null) return;
    const checkFavoriteStatus = async () => {
      const userRef = doc(db, "Favorites", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().actors.some((actor: any) => actor.id === actorId)) {
        setIsFavorited(true);
      }
    };
    checkFavoriteStatus();
  }, [actorId, user]);

  const toggleFavorite = async () => {
    if (!user || !actorId) return alert("You need to be logged in to favorite an actor.");
    const userRef = doc(db, "Favorites", user.uid);
    try {
      const docSnap = await getDoc(userRef);
      const actorData = {
        id: actor?.id,
        name: actor?.name,
        profile_path: actor?.profile_path,
      };
      if (isFavorited) {
        await updateDoc(userRef, { actors: arrayRemove(actorData) });
        setIsFavorited(false);
      } else {
        if (!docSnap.exists()) {
          await setDoc(userRef, { actors: [actorData] });
        } else {
          await updateDoc(userRef, { actors: arrayUnion(actorData) });
        }
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (!actor) {
    return <div className="text-center text-red-500">Actor not found.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="relative h-[450px] mb-8 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${actor.profile_path || ""})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
        <div className="relative h-full container flex items-end pb-8">
          <div className="flex items-end gap-6">
            {actor.profile_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                alt={actor.name}
                className="w-56 h-56 rounded-2xl object-cover border-4 border-gray-800 shadow-lg"
              />
            )}
            <div>
              <h1 className="text-5xl font-extrabold mb-4 flex items-center gap-4">
                {actor.name}
                <button
                  onClick={toggleFavorite}
                  className="focus:outline-none transition-transform transform hover:scale-125"
                >
                  <Heart
                    className={`w-9 h-9 transition-all duration-300 ${isFavorited ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`}
                  />
                </button>
              </h1>
              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <span>{actor.popularity.toFixed(1)} Popularity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actordetails;
