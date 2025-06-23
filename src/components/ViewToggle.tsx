// src/components/ViewToggle.tsx
import React from "react";
import { List, Grid2X2 } from "lucide-react";

type ViewType = "grid" | "list";

interface Props {
  view: ViewType;
  onToggle: (view: ViewType) => void;
}

const ViewToggle: React.FC<Props> = ({ view, onToggle }) => {
  return (
    <div className="flex gap-2 items-center mb-4">
      <button
        onClick={() => onToggle("grid")}
        className={`flex items-center gap-1 px-3 py-1 rounded ${
          view === "grid"
            ? "bg-yellow-500 text-black"
            : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
        }`}
        aria-label="Grid View"
      >
        <Grid2X2 className="w-4 h-4" />
        Grid
      </button>

      <button
        onClick={() => onToggle("list")}
        className={`flex items-center gap-1 px-3 py-1 rounded ${
          view === "list"
            ? "bg-yellow-500 text-black"
            : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
        }`}
        aria-label="List View"
      >
        <List className="w-4 h-4" />
        List
      </button>
    </div>
  );
};

export default ViewToggle;
