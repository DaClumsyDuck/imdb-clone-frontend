import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  facebookSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        const userData = {
          name: currentUser.displayName || "No Name",
          email: currentUser.email,
          profilePicture: currentUser.photoURL || "https://example.com/default.jpg"
        };

        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, userData);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    await updateProfile(newUser, { displayName: name });
    setUser({ ...newUser, displayName: name });

    const userRef = doc(db, "users", newUser.uid);
    await setDoc(userRef, {
      name,
      email: newUser.email,
      profilePicture: "",
    });
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "No Name",
          email: user.email,
          profilePicture: user.photoURL || "",
        });
      }

      setUser(user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const facebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, googleSignIn, facebookSignIn, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
