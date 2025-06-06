import React, { useState, useEffect, useRef } from "react";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const BASE_URL = "https://api.themoviedb.org/3";

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  media_type?: "movie" | "person" | "tv";
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  known_for?: { title: string }[];
};

const SearchBar = ({ searchQuery, setSearchQuery, onSearchSubmit, onFilterToggle }) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setDropdownVisible(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
        setDropdownVisible(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setDropdownVisible(false);
    setSearchQuery(""); // Clear search input

    if (result.media_type === "movie") {
      navigate(`/movie/${result.id}`);
    } else if (result.media_type === "tv") {
      navigate(`/tv/${result.id}`);
    } else if (result.media_type === "person") {
      navigate(`/actor/${result.id}`);
    }
  };

  return (
    <div className="relative w-[450px]" ref={searchRef}>
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 text-black dark:text-white p-2 rounded-full shadow-md transition-all focus-within:ring-2 focus-within:ring-yellow-400">
        <Search className="text-gray-400 ml-3" size={20} />
        <input
          type="text"
          placeholder="Search movies, actors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearchSubmit();
              setSearchQuery("");
              setDropdownVisible(false);
            }
          }}
          className="bg-transparent px-3 py-2 flex-grow focus:outline-none text-black dark:text-white"
        />
        <div className="flex">
          <button
            onClick={() => {
              onSearchSubmit();
              setSearchQuery("");
              setDropdownVisible(false);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-l-full flex items-center gap-2 transition"
          >
            Search
          </button>
          <button
            onClick={onFilterToggle}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-r-full flex items-center gap-2 transition"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {dropdownVisible && (loading || searchResults.length > 0) && (
        <div className="absolute top-full left-0 w-full bg-gray-900 text-white mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-yellow-500 text-center p-3">Loading...</div>
          ) : (
            searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-center gap-4 px-4 py-2 hover:bg-gray-700 transition cursor-pointer"
              >
                {result.poster_path || result.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path || result.profile_path}`}
                    alt={result.title || result.name}
                    className="w-12 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                    N/A
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{result.title || result.name}</p>
                  {result.release_date && (
                    <p className="text-xs text-gray-400">
                      Release Year: {new Date(result.release_date).getFullYear()}
                    </p>
                  )}
                  {result.known_for && result.known_for.length > 0 && (
                    <p className="text-xs text-gray-400">
                      Known for: {result.known_for.map((movie) => movie.title).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
