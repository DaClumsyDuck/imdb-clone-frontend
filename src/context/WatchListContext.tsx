// WatchlistContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WatchlistMovie,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getWatchlist,
} from '../utils/FirebaseWatchlist.tsx';
import { useAuth } from './AuthContext.tsx';

interface WatchlistContextType {
  watchlist: WatchlistMovie[];
  addMovie: (movie: WatchlistMovie) => Promise<void>;
  removeMovie: (movieId: string) => Promise<void>;
  checkWatchlist: (movieId: string) => Promise<boolean>;
  fetchWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  const fetchWatchlist = async () => {
    if (!userId) return;
    const list = await getWatchlist(userId);
    setWatchlist(list);
  };

  const addMovie = async (movie: WatchlistMovie) => {
    if (!userId) throw new Error('User not authenticated');
    await addToWatchlist(userId, movie);
    await fetchWatchlist();
  };

  const removeMovie = async (movieId: string) => {
    if (!userId) throw new Error('User not authenticated');
    await removeFromWatchlist(userId, movieId);
    await fetchWatchlist();
  };

  const checkWatchlist = async (movieId: string): Promise<boolean> => {
    if (!userId) return false;
    return await isInWatchlist(userId, movieId);
  };

  useEffect(() => {
    if (userId) fetchWatchlist();
    else setWatchlist([]);
  }, [userId]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addMovie,
        removeMovie,
        checkWatchlist,
        fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
};
