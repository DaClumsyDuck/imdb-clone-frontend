import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { User, LogOut, Edit } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext.tsx";
import { collection, query, where, getDocs } from "firebase/firestore";


interface ExtendedUser {
  name?: string;
  profilePicture?: string;
  email: string;
  watchlist?: string[];
  ratedMovies?: { movieId: string; rating: number }[];
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([]);
  const TMDB_API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
  const [ratedMoviesData, setRatedMoviesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as ExtendedUser;
          setExtendedUser(userData);
          setNewName(userData.name || "");
          setNewProfilePicture(userData.profilePicture || "");
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: newName,
        profilePicture: newProfilePicture,
      });
      setExtendedUser((prev) => ({ ...prev!, name: newName, profilePicture: newProfilePicture }));
      toast.success("Profile updated!");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile!");
    }
  };

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      if (!extendedUser?.watchlist?.length) return;
      const movies = await Promise.all(
        extendedUser.watchlist.map(async (id) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`);
            return await res.json();
          } catch (err) {
            console.error("Failed to fetch movie", id);
            return null;
          }
        })
      );
      setWatchlistMovies(movies.filter(Boolean));
    };

    fetchWatchlistMovies();
  }, [extendedUser?.watchlist]);

  useEffect(() => {
    const fetchRatedMovies = async () => {
      if (!user) return;
      try {
        const ratingsQuery = query(
          collection(db, "ratings"),
          where("userId", "==", user.uid)
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratedMoviesList = ratingsSnapshot.docs.map((doc) => doc.data());

        const movies = await Promise.all(
          ratedMoviesList.map(async ({ movieId, rating }) => {
            try {
              const res = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
              );
              const data = await res.json();
              return { ...data, rating };
            } catch (err) {
              console.error("Failed to fetch rated movie", movieId);
              return null;
            }
          })
        );

        setRatedMoviesData(movies.filter(Boolean));
      } catch (error) {
        console.error("Error fetching rated movies:", error);
      }
    };

    fetchRatedMovies();
  }, [user]);
  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="text-center text-white mt-10">Loading...</div>;

  return (
    <div className="min-h-screen pt-20 bg-white text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-black dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors duration-300">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-yellow-500" /> Profile
        </h1>

        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={extendedUser?.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500 shadow-md"
            />
          </div>

          {editing && (
            <input
              type="text"
              placeholder="Profile Picture URL"
              value={newProfilePicture}
              onChange={(e) => setNewProfilePicture(e.target.value)}
              className="text-black p-2 mt-3 rounded w-full max-w-sm"
            />
          )}

          {editing ? (
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-black p-2 mt-4 rounded w-full max-w-sm"
            />
          ) : (
            <h2 className="text-2xl mt-4 font-semibold">
              {extendedUser?.name || extendedUser?.email}
            </h2>
          )}

          <button
            onClick={editing ? handleSaveChanges : () => setEditing(true)}
            className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {editing ? "Save" : "Edit Profile"}
          </button>
        </div>

        <div className="mt-10 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">🎬 Watchlist</h2>
          {watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {watchlistMovies.map((movie) => (
                <div key={movie.id} className="text-center">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg mx-auto"
                  />
                  <p className="mt-2 text-sm">{movie.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">Check Watchlist Page</p>
          )}
        </div>


        <div className="mt-10 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">⭐ Rated Movies</h2>
          {ratedMoviesData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ratedMoviesData.map((movie) => (
                <div key={movie.id} className="text-center">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg mx-auto"
                  />
                  <p className="mt-2 text-sm font-semibold">{movie.title}</p>
                  <p className="text-yellow-400">{movie.rating} ⭐</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No ratings yet.</p>
          )}
        </div>


        <button
          onClick={handleLogout}
          className="mt-12 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;
