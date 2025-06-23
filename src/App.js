import "./App.css";
import Navbar from "./components/Navbar.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.tsx";
import MovieList from "./Pages/MovieList.tsx";
import ProfilePage from "./Pages/ProfilePage.tsx";
import LoginModal from "./components/LoginModal.tsx";
import SignUpModal from "./components/SignUpModal.tsx";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext.tsx";
import SearchResultsPage from "./Pages/SearchResultsPage.tsx";
import MovieDetails from "./Pages/MovieDetails.tsx";
import ActorDetails from "./Pages/Actordetails.tsx";
import FavoriteActorsPage from "./Pages/FavoriteActorsPage.tsx";
import Toprated from "./Pages/Toprated.tsx";
import TVShowDetails from "./Pages/TVShowDetails.tsx";
import ComingSoonPage from "./Pages/ComingSoonPage.tsx";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { WatchlistProvider, useWatchlist } from "./context/WatchListContext.tsx";
import WatchlistPage from "./Pages/WatchListPage.tsx";
import { RatingProvider } from "./context/RatingContext.tsx";
import { ToastContainer } from 'react-toastify';
import { ViewModeProvider } from "./context/ViewModeContext.tsx";


function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);
  const openSignUpModal = () => setSignUpModalOpen(true);
  const closeSignUpModal = () => setSignUpModalOpen(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in:", user.uid);
        setUser(user);
      } else {
        console.log("No user signed in.");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <ViewModeProvider>
        <WatchlistProvider>
          <RatingProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-black text-white">
                <Navbar
                  onProfileClick={openLoginModal}
                  onSignUpClick={openSignUpModal}
                />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<MovieList />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/searchresults" element={<SearchResultsPage />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/actor/:id" element={<ActorDetails />} />
                  <Route path="/favorite-actors" element={<FavoriteActorsPage />} />
                  <Route path="/top-rated" element={<Toprated />} />
                  <Route path="/tv/:id" element={<TVShowDetails />} />
                  <Route path="/coming-soon" element={<ComingSoonPage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                </Routes>
                <LoginModal
                  isOpen={isLoginModalOpen}
                  onClose={closeLoginModal}
                  onSignUpClick={openSignUpModal}
                />
                <SignUpModal
                  isOpen={isSignUpModalOpen}
                  onClose={closeSignUpModal}
                />
              </div>
            </BrowserRouter>
          </RatingProvider>
        </WatchlistProvider>
      </ViewModeProvider>
    </AuthProvider>
  );
}

export default App;
