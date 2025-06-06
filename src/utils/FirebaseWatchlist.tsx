// src/utils/FirebaseWatchlist.tsx
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  collection, 
  getDocs,
  serverTimestamp,
  query,
  where 
} from 'firebase/firestore';

export interface WatchlistMovie {
  id: string;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  userId: string; // Include userId in the document
  addedAt?: any; // For Firestore timestamp
}

// Add a movie to the watchlist
export const addToWatchlist = async (userId: string, movie: WatchlistMovie): Promise<void> => {
  try {
    const docId = `${userId}_${movie.id}`;
    const movieRef = doc(db, 'watchlist', docId);
    
    await setDoc(movieRef, { 
      ...movie,
      // No need to include userId here if it's not in the interface
      addedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw new Error('Failed to add to watchlist');
  }
};

// Remove a movie from the watchlist
export const removeFromWatchlist = async (userId: string, movieId: string): Promise<void> => {
  try {
    const docId = `${userId}_${movieId}`;
    const movieRef = doc(db, 'watchlist', docId);
    await deleteDoc(movieRef);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw new Error('Failed to remove from watchlist');
  }
};

// Check if a movie is in the watchlist
export const isInWatchlist = async (userId: string, movieId: string): Promise<boolean> => {
  try {
    const docId = `${userId}_${movieId}`;
    const movieRef = doc(db, 'watchlist', docId);
    const docSnap = await getDoc(movieRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

// Get all watchlist movies for a user
export const getWatchlist = async (userId: string): Promise<WatchlistMovie[]> => {
  try {
    const watchlistRef = collection(db, 'watchlist');
    const q = query(watchlistRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.data().id, // The original movie ID
      ...doc.data()
    })) as WatchlistMovie[];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};