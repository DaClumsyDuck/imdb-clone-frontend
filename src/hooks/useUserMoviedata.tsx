import { useEffect, useMemo, useState } from "react";
import { useWatchlist } from "../context/WatchListContext.tsx";
import getUserRatings from "../utils/firebaseRatings.tsx";

const useUserMovieData = (userId: string) => {
  const { watchlist } = useWatchlist();
  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchRatings = async () => {
      const userRatings = await getUserRatings(userId);
      setRatings(userRatings);
    };

    fetchRatings();
  }, [userId]);

  const userWatchlist = useMemo(() => watchlist.map((movie) => movie.id), [watchlist]);
  const userRatings = useMemo(() => ratings, [ratings]);

  return {
    userWatchlist,
    userRatings,
  };
};

export default useUserMovieData;
