import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.tsx";

interface Genre {
  id: number;
  name: string;
}

interface Actor {
  id: number;
  name: string;
}

interface FilterPanelProps {
  year: string;
  setYear: (year: string) => void;
  genre: string[];
  setGenre: React.Dispatch<React.SetStateAction<string[]>>;
  actor: string;
  setActor: (actor: string) => void;
  onApplyFilters: () => void;
  clearFilters: () => void;
  closeFilterPanel: () => void;
}

const TMDB_API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";

const FilterPanel: React.FC<FilterPanelProps> = ({
  year,
  setYear,
  genre,
  setGenre,
  actor,
  setActor,
  onApplyFilters,
  clearFilters,
  closeFilterPanel,
}) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(false);
  const [loadingActors, setLoadingActors] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showActorSuggestions, setShowActorSuggestions] =
    useState<boolean>(false);
  const { theme } = useTheme();
  const [shouldAutoNavigate, setShouldAutoNavigate] = useState(true);


  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
        );
        if (!response.ok) throw new Error("Failed to fetch genres");
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (err) {
        setError("Error fetching genres. Please try again.");
        console.error(err);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (actor.length < 2) return;

    const fetchActors = async () => {
      setLoadingActors(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${actor}`
        );
        if (!response.ok) throw new Error("Failed to fetch actors");
        const data = await response.json();
        setActors(data.results || []);
        setShowActorSuggestions(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActors(false);
      }
    };

    const debounceFetch = setTimeout(fetchActors, 500);
    return () => clearTimeout(debounceFetch);
  }, [actor]);

  useEffect(() => {
    if (!shouldAutoNavigate) return;

    const queryParams = new URLSearchParams();
    if (year) queryParams.set("year", year);
    if (genre.length) queryParams.set("genres", genre.join(","));
    if (actor) queryParams.set("actor", actor);

    navigate(`/searchresults?${queryParams.toString()}`);
  }, [year, genre, actor, navigate, shouldAutoNavigate]);


  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        closeFilterPanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeFilterPanel]);

  const handleApplyFilters = () => {
    const queryParams = new URLSearchParams();
    if (year) queryParams.set("year", year);
    if (genre.length) queryParams.set("genres", genre.join(","));
    if (actor) queryParams.set("actor", actor);
  
    // Temporarily disable auto navigation so it doesn’t fire again immediately
    setShouldAutoNavigate(false);
    navigate(`/searchresults?${queryParams.toString()}`);
  
    // Re-enable live update after short delay
    setTimeout(() => setShouldAutoNavigate(true), 500);
  };
  

  const handleGenreChange = (selectedId: string) => {
    setGenre((prevGenres) =>
      prevGenres.includes(selectedId)
        ? prevGenres.filter((id) => id !== selectedId)
        : [...prevGenres, selectedId]
    );
  };

  const handleActorSelect = (actorName: string) => {
    setActor(actorName);
    setActors([]);
    setShowActorSuggestions(false);
  };

  return (
    <div
      ref={panelRef}
      className={`absolute top-16 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg w-80 transition-colors ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
    >
      <h3 className="text-lg font-semibold mb-3">Filter Movies</h3>

      {/* Year Input */}
      <input
        type="text"
        placeholder="Year (e.g., 2023)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className={`w-full mb-2 p-2 rounded transition-colors ${theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-900"
          }`}
      />

      {/* Genre Selection */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold mb-1">Genres</h4>
        {loadingGenres ? (
          <p>Loading genres...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
            {genres.map((g) => (
              <label key={g.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={g.id}
                  checked={genre.includes(g.id.toString())}
                  onChange={() => handleGenreChange(g.id.toString())}
                  className="accent-yellow-500"
                />
                <span>{g.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Actor Input */}
      <div className="mb-2 relative">
        <input
          type="text"
          placeholder="Actor name"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className={`w-full mb-2 p-2 rounded transition-colors ${theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-900"
            }`}
        />

        {/* Actor Suggestions Dropdown */}
        {showActorSuggestions && actors.length > 0 && (
          <div
            className={`absolute top-full left-0 w-full rounded shadow-lg mt-1 max-h-40 overflow-y-auto z-50 transition-colors ${theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-900"
              }`}
          >
            {actors.map((a) => (
              <div
                key={a.id}
                className="p-2 cursor-pointer hover:bg-gray-700"
                onClick={() => handleActorSelect(a.name)}
              >
                {a.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <button
        onClick={clearFilters}
        className={`w-full p-2 rounded font-semibold transition mb-2 ${theme === "dark"
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-gray-300 hover:bg-gray-400 text-gray-900"
          }`}
      >
        Clear Filters
      </button>

      <button
        onClick={handleApplyFilters}
        className={`w-full p-2 rounded font-semibold transition ${theme === "dark"
            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
            : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
          }`}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterPanel;
