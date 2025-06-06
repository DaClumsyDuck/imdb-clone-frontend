import YouTube from "react-youtube";
import {
  Award,
  Calendar,
  Clock,
  Globe,
  Heart,
  Link,
  Play,
  Star,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import TrailerModal from "../components/TrailerModal.tsx";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "../context/ThemeContext.tsx";
import UserReviews from "../components/UserReviews.tsx";

interface Genre {
  id: number;
  name: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  rating?: number;
}

interface TVShow {
  id: number;
  name: string;
  tagline?: string;
  backdrop_path?: string;
  poster_path?: string;
  first_air_date?: string;
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_average?: number;
  overview?: string;
  reviews?: Review[];
}

interface TVShow {
  id: number;
  name: string;
  tagline?: string;
  backdrop_path?: string;
  poster_path?: string;
  first_air_date?: string;
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_average?: number;
  overview?: string;
  reviews?: Review[];
}

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TVShow | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [trailerModal, setTrailerModal] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [trailers, setTrailers] = useState<string[]>([]);
  const [tvShowImages, setTvShowImages] = useState<string[]>([]);
  const [castList, setCastList] = useState<
    { id: number; name: string; image: string; role: string }[]
  >([]);

  const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";

  useEffect(() => {
    const fetchTVShowDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&append_to_response=credits,images,videos,reviews`
        );
        if (!response.ok) throw new Error("Failed to fetch TV show details");

        const data = await response.json();

        setTvShow(data);
        setLoading(false);

        // Extract cast details
        const castData =
          data.credits?.cast?.map((actor) => ({
            id: actor.id,
            name: actor.name,
            image: actor.profile_path
              ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
              : "/default-profile.png",
            role: actor.character,
          })) || [];
        setCastList(castData);

        // Extract images
        const imageUrls =
          data.images?.backdrops?.map(
            (image) => `https://image.tmdb.org/t/p/original${image.file_path}`
          ) || [];
        setTvShowImages(imageUrls);

        // Extract trailers
        const trailerLinks = data.videos?.results
          ?.filter(
            (video) => video.site === "YouTube" && video.type === "Trailer"
          )
          .map((video) => `https://www.youtube.com/embed/${video.key}`);
        setTrailers(trailerLinks || []);

        const trailer = data.videos?.results?.find(
          (video) => video.type === "Trailer"
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        UserReviews({ reviews: [] });
      }
    };

    fetchTVShowDetails();
  }, [id]);

  if (loading)
    return <p className="text-white text-center text-lg">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!tvShow)
    return <p className="text-white text-center">TV Show not found.</p>;

  return (
    <div className="relative pt-20 bg-black text-white min-h-screen">
      {/* Backdrop Image with Gradient Overlay */}
      <div className="relative h-[90vh]">
        {/* Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${tvShow.backdrop_path})`,
          }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-t transition-colors duration-300 
      ${
        theme === "dark"
          ? "from-black via-black/80"
          : "from-gray-900 via-gray-900/80"
      }`}
          />
        </div>

        {/* TV Show Details */}
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {/* TV Show Poster */}
            {tvShow.poster_path && (
              <div className="hidden md:block">
                <img
                  src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                  alt={tvShow.name}
                  className="rounded-lg shadow-xl aspect-[2/3] object-cover"
                />
              </div>
            )}

            {/* TV Show Info */}

            <div className="md:col-span-2">
              <h1
                className={`text-4xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-500"
                }`}
              >
                {tvShow.name}
              </h1>
              {tvShow.tagline && (
                <p className="text-lg italic text-gray-300">{tvShow.tagline}</p>
              )}
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tvShow.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <p
                className={`text-lg mt-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {tvShow.overview || "No overview available."}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-6 h-6" />
                  <span
                    className={`text-lg font-bold ${
                      theme === "dark" ? "text-yellow-300" : "text-yellow-700"
                    }`}
                  >
                    {tvShow.vote_average?.toFixed(1) ?? "N/A"}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {trailers.length > 0 && (
        <section className="mb-12 px-8">
          <h2 className="text-2xl font-bold mb-4">Trailers</h2>
          <Swiper
            navigation
            pagination
            autoplay={{ delay: 5000 }}
            loop
            modules={[Navigation, Pagination, Autoplay]}
            className="h-80 rounded-lg overflow-hidden"
          >
            {trailers.map((trailer, index) => (
              <SwiperSlide key={index} className="relative group">
                <button
                  onClick={() => {
                    setTrailerModal(true);
                    setSelectedTrailer(trailer);
                  }}
                  className="w-full h-full relative"
                >
                  <img
                    src={`https://img.youtube.com/vi/${
                      trailer.split("embed/")[1]
                    }/maxresdefault.jpg`}
                    alt="Trailer Thumbnail"
                    className="w-full h-full object-cover rounded-lg brightness-75 transition duration-300 group-hover:brightness-50"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30 group-hover:bg-black/50 transition duration-300">
                    <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition duration-300" />
                    <span className="text-white font-semibold mt-2 opacity-80 group-hover:opacity-100 transition duration-300">
                      Watch Trailer
                    </span>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Trailer Modal */}
          {trailerModal && selectedTrailer && (
            <TrailerModal
              trailerUrl={selectedTrailer}
              onClose={() => setTrailerModal(false)}
            />
          )}
        </section>
      )}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">TV Show Images</h2>
        {tvShowImages.length > 0 ? (
          <Swiper
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            loop
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={15}
            slidesPerView="auto"
            slidesPerGroup={Math.min(tvShowImages.length, 3)} // Move in sets of 3
            breakpoints={{
              320: { slidesPerView: 1, slidesPerGroup: 1 }, // Small screens: 1 per slide
              480: { slidesPerView: 2, slidesPerGroup: 2 }, // Mobile: 2 per slide
              768: { slidesPerView: 3, slidesPerGroup: 3 }, // Tablet: 3 per slide
              1024: { slidesPerView: 4, slidesPerGroup: 4 }, // Desktop: 4 per slide
            }}
            className="rounded-lg overflow-hidden"
          >
            {tvShowImages.map((image, index) => (
              <SwiperSlide key={index} className="flex justify-center">
                <img
                  src={image}
                  alt={`TV Show Image ${index + 1}`}
                  className="h-[220px] w-[350px] object-cover rounded-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-gray-400 text-lg">No images available</p>
        )}
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {castList.length > 0 ? (
            castList.map((actor) => (
              <a
                key={actor.id}
                href={`/actor/${actor.id}`}
                className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 flex flex-col items-center text-center"
              >
                <img
                  src={actor.image}
                  alt={actor.name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-600 hover:border-yellow-500 transition-all duration-300"
                />
                <div className="mt-3">
                  <h3 className="font-semibold text-lg">{actor.name}</h3>
                  <p className="text-gray-400 text-sm">{actor.role}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="text-gray-400 text-lg">
              No cast information available
            </p>
          )}
        </div>
      </section>
      <UserReviews reviews={tvShow.reviews || []} />
    </div>
  );
};

export default TVShowDetails;
