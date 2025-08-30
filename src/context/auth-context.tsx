"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserByUsername } from '@/lib/data';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // In a real app, you'd fetch the user profile from your database
        // For this demo, we'll try to find a mock user or create a new one
        const username = firebaseUser.email?.split('@')[0] || 'newuser';
        let appUser = getUserByUsername(username);

        if (appUser) {
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: appUser.name,
                photoURL: appUser.avatar,
                username: appUser.username,
            });
        } else {
             // Fallback for demonstration if no specific user is matched
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'New User',
                photoURL: firebaseUser.photoURL,
                username: username
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = { user, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
