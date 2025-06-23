import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Film } from "lucide-react";
import SearchBar from "./SearchBar.tsx";
import FilterPanel from "./FilterPanel.tsx";
import { useTheme } from "../context/ThemeContext.tsx";
import { FaSun, FaMoon } from "react-icons/fa";
import ViewToggle from "../components/ViewToggle.tsx";
import { useViewMode } from "../context/ViewModeContext.tsx";

interface NavbarProps {
  onProfileClick: () => void;
}

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black transition-all"
    >
      {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ onProfileClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [actor, setActor] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const { viewMode, toggleViewMode } = useViewMode();

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      onProfileClick();
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim() && !year && !genre.length && !actor) return;

    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set("query", searchQuery);
    if (year) queryParams.set("year", year);
    if (genre.length) queryParams.set("genre", genre.join(","));
    if (actor) queryParams.set("actor", actor);

    navigate(`/searchresults?${queryParams.toString()}`);
    setFilterOpen(false); // Close filter panel after applying filters
  };

  const handleClearFilters = () => {
    setYear("");
    setGenre([]);
    setActor("");
    setSearchQuery("");
  };

  // Function to close the filter panel when clicking outside
  const closeFilterPanel = () => {
    setFilterOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white py-4 px-6 shadow-md fixed w-full top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-yellow-400 hover:text-yellow-300 transition duration-200"
        >
          <Film className="w-8 h-8 text-yellow-400" />
          <span className="text-3xl font-bold">MovieDB</span>
        </Link>

        {/* Search Bar & Filter */}
        <div className="relative">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onFilterToggle={() => setFilterOpen(!filterOpen)}
          />
          {filterOpen && (
            <FilterPanel
              year={year}
              setYear={setYear}
              genre={genre}
              setGenre={setGenre}
              actor={actor}
              setActor={setActor}
              onApplyFilters={handleSearchSubmit}
              clearFilters={handleClearFilters}
              closeFilterPanel={closeFilterPanel} // ✅ Fixed: Pass closeFilterPanel
            />
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-yellow-500">
            Home
          </Link>
          <Link to="/movies" className="hover:text-yellow-500">
            Movies
          </Link>
          <Link to="/top-rated" className="hover:text-yellow-500">Top Rated</Link>
          <Link to="/favorite-actors" className="hover:text-yellow-500">Favorites</Link>
          <Link to="/watchlist" className="hover:text-yellow-500">Watchlist</Link>
          <button
            onClick={handleProfileClick}
            className="hover:text-yellow-500"
          >
            Profile
          </button>
          <ViewToggle view={viewMode} onToggle={toggleViewMode} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
