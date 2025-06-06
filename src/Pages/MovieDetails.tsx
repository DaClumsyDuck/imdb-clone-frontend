import { DollarSign, Globe, Play, Star } from "lucide-react";
import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { useRef } from "react";
import TrailerModal from "../components/TrailerModal.tsx";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTheme } from "../context/ThemeContext.tsx";
import { useWatchlist } from "../context/WatchListContext.tsx";
import { WatchlistMovie } from "../utils/FirebaseWatchlist.ts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext.tsx';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../utils/FirebaseWatchlist.tsx';
import { auth } from '../firebase';


const API_KEY = "621fe1fbfc8a8166a4336d9410f36ac6";
const BASE_URL = "https://api.themoviedb.org/3";

interface Review {
  id: string;
  author: string;
  content: string;
  rating?: number;
  avatar?: string;
}

interface MovieDetails {
  id: number;
  title: string;
  images?: { backdrops: { file_path: string }[] };
  reviews?: Review[];
}

interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  rating: number;
  year: number;
  duration: string;
  genre: string[];
  director: string;
  description: string;
  image: string;
  backdrop: string;
  cast: { id: number; name: string; role: string; image: string }[];
  trailers: string[];
  boxOffice: string;
  language: string;
  productionCompany: string;
  awards: string[];
  metacriticScore: string;
  rottenTomatoesScore: string;
  tmdbRating: number;
  images: string[];
  reviews: Review[];
  poster_path: string;
  vote_average: number;
}

interface MovieDetailsProps {
  movie: WatchlistMovie;
}

const MovieDetails: React.FC = () => {
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trailerModal, setTrailerModal] = useState<boolean>(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [actorDetails, setActorDetails] = useState<{ [key: number]: string }>(
    {}
  );
  const [expanded, setExpanded] = useState<boolean>(false);
  const { theme } = useTheme();
  const { addMovie, removeMovie, checkWatchlist } = useWatchlist();
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [currentUser] = useState(auth);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,release_dates,images,reviews`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");

        const data = await response.json();

        let metacriticScore = "N/A";
        let rottenTomatoesScore = "N/A";

        if (data.release_dates?.results) {
          const usRelease = data.release_dates.results.find(
            (r: any) => r.iso_3166_1 === "US"
          );
          if (usRelease && usRelease.release_dates) {
            const ratings = usRelease.release_dates.find(
              (r: any) => r.certification
            );
            if (ratings) {
              rottenTomatoesScore = ratings.certification;
            }
          }
        }

        const awards = [
          "Best Picture - Academy Awards",
          "Best Director - BAFTA",
        ];

        const movieDetails: Movie = {
          id: data.id || 0,
          title: data.title || "Unknown Title",
          rating: data.vote_average || 0,
          poster_path: data.poster_path || "",
          vote_average: data.vote_average || 0,

          year: data.release_date
            ? new Date(data.release_date).getFullYear()
            : 0,
          duration: data.runtime
            ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
            : "N/A",
          genre: data.genres?.map((g: { name: string }) => g.name) || [],
          director:
            data.credits?.crew?.find(
              (p: { job: string }) => p.job === "Director"
            )?.name || "Unknown",
          description: data.overview || "No description available",
          image: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : "",
          backdrop: data.backdrop_path
            ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
            : "",
          cast:
            data.credits?.cast?.slice(0, 6).map((actor: any) => ({
              id: actor.id,
              name: actor.name,
              role: actor.character,
              image: actor.profile_path
                ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                : "",
            })) || [],
          trailers:
            data.videos?.results
              ?.filter((video: any) => video.type === "Trailer")
              .map(
                (video: any) => `https://www.youtube.com/embed/${video.key}`
              ) || [],
          boxOffice: data.revenue
            ? `$${(data.revenue / 1_000_000).toFixed(1)}M`
            : "N/A",
          language:
            data.spoken_languages
              ?.map((lang: { english_name: string }) => lang.english_name)
              .join(", ") || "Unknown",
          productionCompany: data.production_companies?.[0]?.name || "Unknown",
          releaseDate: data.release_date || "Unknown",
          awards,
          metacriticScore,
          rottenTomatoesScore,
          tmdbRating: data.vote_average || 0,
          images:
            data.images?.backdrops
              ?.filter((img: any) => img.file_path)
              .map(
                (img: any) =>
                  `https://image.tmdb.org/t/p/original${img.file_path}`
              ) || [],
          reviews:
            data.reviews?.results?.map((review: any) => ({
              id: review.id,
              author: review.author || "Anonymous",
              content: review.content || "No review text available.",
              rating: review.author_details?.rating || "N/A",
              avatar: review.author_details?.avatar_path
                ? `https://image.tmdb.org/t/p/w200${review.author_details.avatar_path}`
                : "",
            })) || [],
        };
        setMovie(movieDetails);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchActorDetails = async () => {
      if (!movie || movie.cast.length === 0) return;
      const newActorDetails: { [key: number]: string } = {};
      await Promise.all(
        movie.cast.map(async (actor) => {
          try {
            const response = await fetch(
              `${BASE_URL}/person/${actor.id}?api_key=${API_KEY}`
            );
            if (!response.ok) throw new Error("Failed to fetch actor details");
            const data = await response.json();
            newActorDetails[actor.id] =
              data.biography || "No biography available.";
          } catch (error) {
            newActorDetails[actor.id] = "No biography available.";
          }
        })
      );
      setActorDetails(newActorDetails);
    };

    fetchActorDetails();
  }, [movie]);

  useEffect(() => {
    const fetchWatchlistStatus = async () => {
      if (!movie?.id) return;
      const status = await checkWatchlist(movie.id.toString());
      setIsInList(status);
    };
    fetchWatchlistStatus();
  }, [movie?.id, checkWatchlist]);

  const handleWatchlistClick = async () => {
    if (!movie || !user) return; // Make sure you have currentUser from your auth context
    setLoading(true);
  
    try {
      const movieData: WatchlistMovie = {
        id: movie.id.toString(),
        title: movie.title,
        poster_path: movie.poster_path.includes('http') 
          ? movie.poster_path.split('/').pop() || movie.poster_path
          : movie.poster_path,
        release_date: movie.releaseDate,
        vote_average: movie.vote_average,
        userId: user.uid // Add the userId here
      };
  
      if (isInList) {
        await removeFromWatchlist(user.uid, movie.id.toString());
        setIsInList(false);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist(user.uid, movieData);
        setIsInList(true);
        toast.success('Added to watchlist');
      }
    } catch (err) {
      console.error('Watchlist error:', err);
      toast.error(`Error updating watchlist: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  if (!movie) return <div>Loading...</div>;

  return (
    <div
      className={`min-h-screen p-6 pt-20 transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white "
        }`}
    >
      <div className="relative h-[90vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop || movie.image})` }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-t transition-colors duration-300 
            ${theme === "dark"
                ? "from-black via-black/80"
                : "from-gray-900 via-gray-900/80"
              }`}
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="hidden md:block">
              <img
                src={movie.image}
                alt={movie.title}
                className="rounded-lg shadow-xl aspect-[2/3] object-cover"
              />
            </div>
            <div className="md:col-span-2">
              <h1
                className={`text-4xl font-bold ${theme === "dark" ? "text-white" : "text-grey-500"
                  }`}
              >
                {movie.title}
              </h1>
              <div>
                <h1>{movie.title}</h1>
                <button
                  onClick={handleWatchlistClick}
                  disabled={loading}
                  className={`px-4 py-2 rounded flex items-center gap-2 ${isInList
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white transition-colors`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : isInList ? (
                    'Remove from Watchlist'
                  ) : (
                    'Add to Watchlist'
                  )}
                </button>
              </div>
              <p
                className={`text-lg mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
              >
                {movie.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-6 h-6" />
                  <span
                    className={`text-lg font-bold ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"
                      }`}
                  >
                    {movie.rating}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Trailers</h2>
          <Swiper
            navigation
            pagination
            autoplay={{ delay: 5000 }}
            loop
            modules={[Navigation, Pagination, Autoplay]}
            className="h-80 rounded-lg overflow-hidden"
          >
            {movie.trailers.length > 0 ? (
              movie.trailers.map((trailer, index) => (
                <SwiperSlide key={index} className="relative group">
                  <button
                    onClick={() => {
                      setTrailerModal(true);
                      setSelectedTrailer(trailer);
                    }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${trailer.split("embed/")[1]
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
              ))
            ) : (
              <p className="text-white">No trailers available</p>
            )}
          </Swiper>

          {/* Trailer Modal */}
          {trailerModal && (
            <TrailerModal
              trailerUrl={selectedTrailer}
              onClose={() => setTrailerModal(false)}
            />
          )}
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Movie Images</h2>
          {movie.images && movie.images.length > 0 ? (
            <Swiper
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              loop
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={15}
              slidesPerView="auto"
              slidesPerGroup={Math.min(movie.images.length, 3)} // Move in sets of 3
              breakpoints={{
                320: { slidesPerView: 1, slidesPerGroup: 1 }, // Small screens: 1 per slide
                480: { slidesPerView: 2, slidesPerGroup: 2 }, // Mobile: 2 per slide
                768: { slidesPerView: 3, slidesPerGroup: 3 }, // Tablet: 3 per slide
                1024: { slidesPerView: 4, slidesPerGroup: 4 }, // Desktop: 4 per slide
              }}
              className="rounded-lg overflow-hidden"
            >
              {movie.images.map((image, index) => (
                <SwiperSlide key={index} className="flex justify-center">
                  <img
                    src={image}
                    alt={`Movie ${index + 1}`}
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
            {movie.cast.map((actor) => (
              <Link
                key={actor.id}
                to={`/actor/${actor.id}`}
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
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {actorDetails[actor.id] || "Loading..."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <div>
          <div className="sticky top-24 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-4">Movie Info</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-gray-400">Director</dt>
                  <dd>{movie.director}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Production Company</dt>
                  <dd>{movie.productionCompany}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-gray-400">Box Office</dt>
                  <dd className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    {movie.boxOffice}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-gray-400">Language</dt>
                  <dd className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-blue-500" />
                    {movie.language}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">User Reviews</h2>
          {movie.reviews && movie.reviews.length > 0 ? (
            <div className="relative">
              {/* Scroll Buttons */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all z-10"
                onClick={() => {
                  if (reviewsRef.current) {
                    reviewsRef.current.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <FaChevronLeft className="text-white text-lg" />
              </button>

              <div
                ref={reviewsRef}
                className="overflow-x-auto flex space-x-4 p-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
              >
                {movie.reviews.map((review) => {
                  return (
                    <div
                      key={review.id}
                      className="w-80 bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 snap-center flex flex-col"
                    >
                      {/* Reviewer Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.author}
                            className="w-12 h-12 rounded-full border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-bold">
                            {review.author.charAt(0)}
                          </div>
                        )}
                        <div className="w-48 truncate">
                          <h3 className="text-lg font-semibold truncate">
                            {review.author}
                          </h3>
                          {review.rating !== undefined && (
                            <p className="text-yellow-400 text-sm font-medium">
                              ⭐ {review.rating}/10
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Review Content */}
                      <p
                        className={`text-gray-300 text-sm leading-relaxed ${expanded ? "" : "line-clamp-4"
                          }`}
                      >
                        {review.content}
                      </p>
                      <button
                        className="text-blue-400 mt-2 text-sm self-start hover:underline"
                        onClick={() => setExpanded(!expanded)}
                      >
                        {expanded ? "Show Less" : "Read More"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all z-10"
                onClick={() => {
                  if (reviewsRef.current) {
                    reviewsRef.current.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <FaChevronRight className="text-white text-lg" />
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-lg">No reviews available</p>
          )}
        </section>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};
export default MovieDetails;
