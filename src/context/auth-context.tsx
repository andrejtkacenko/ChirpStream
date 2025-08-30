"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';


interface AuthContextType {
  user: FirebaseUser | null;
  appUser: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getOrCreateAppUser(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    } else {
        const username = firebaseUser.email?.split('@')[0] || `user${Math.random().toString(36).substring(2, 8)}`;
        const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "New User",
            username: username,
            avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${username}/100/100`,
            bio: "Just joined ChirpStream!",
            following: [],
            followers: [],
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const appUserData = await getOrCreateAppUser(firebaseUser);
        setAppUser(appUserData);
      } else {
        setUser(null);
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = { user, appUser, loading, logout };

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
