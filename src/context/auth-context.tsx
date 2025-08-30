"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserByUsername, currentUser } from '@/lib/data';

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
        // For now, we'll find a mock user or default to the current user
        const mockUser = getUserByUsername('alice'); // or some logic to map firebaseUser.uid to your user
        if (mockUser) {
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: mockUser.name,
                photoURL: mockUser.avatar,
                username: mockUser.username,
            });
        } else {
            // Fallback for demonstration if no specific user is matched
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'New User',
                photoURL: firebaseUser.photoURL,
                username: firebaseUser.email?.split('@')[0] || 'newuser'
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
