import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ExtendedUser {
  name?: string;
  profilePicture?: string;
  email: string;
  watchlist?: string[];
  ratedMovies?: { title: string; rating: number }[];
  reviews?: { movie: string; review: string }[];
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState("");

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

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold flex items-center gap-2 mb-6">
        <User className="w-8 h-8 text-yellow-500" /> User Profile
      </h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        {editing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="text-black p-2 rounded"
          />
        ) : (
          <h2 className="text-2xl mb-2">{extendedUser?.name || extendedUser?.email}</h2>
        )}

        <img
          src={extendedUser?.profilePicture || "default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full my-4"
        />

        {editing ? (
          <input
            type="text"
            value={newProfilePicture}
            onChange={(e) => setNewProfilePicture(e.target.value)}
            className="text-black p-2 rounded"
          />
        ) : null}

        <button
          onClick={editing ? handleSaveChanges : () => setEditing(true)}
          className="bg-yellow-500 px-4 py-2 mt-4 rounded"
        >
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl text-yellow-500">Watchlist</h2>
        <ul>
          {extendedUser?.watchlist?.length ? extendedUser.watchlist.map((movie) => <li key={movie}>{movie}</li>) : <p>No movies added.</p>}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl text-yellow-500">Rated Movies</h2>
        <ul>
          {extendedUser?.ratedMovies?.length ? (
            extendedUser.ratedMovies.map((movie) => (
              <li key={movie.title}>{movie.title} - {movie.rating} ⭐</li>
            ))
          ) : (
            <p>No ratings yet.</p>
          )}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl text-yellow-500">Reviews</h2>
        <ul>
          {extendedUser?.reviews?.length ? (
            extendedUser.reviews.map((review) => (
              <li key={review.movie}><strong>{review.movie}</strong>: {review.review}</li>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </ul>
      </div>

      <button onClick={handleLogout} className="bg-red-500 px-4 py-2 mt-6 rounded flex items-center gap-2">
        <LogOut /> Log Out
      </button>
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;
