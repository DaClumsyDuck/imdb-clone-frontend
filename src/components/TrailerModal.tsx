import React from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  trailerUrl: string | null;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, onClose }) => {
  if (!trailerUrl) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full max-w-4xl p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black p-2 rounded-full hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-full aspect-video">
          <iframe
            src={trailerUrl}
            title="Movie Trailer"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
