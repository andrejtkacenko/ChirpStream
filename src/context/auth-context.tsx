
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: User | null;
  users: (FirebaseUser | null)[];
  appUsers: (User | null)[];
  loading: boolean;
  logout: (redirect?: boolean) => void;
  switchUser: (user: FirebaseUser) => void;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_UID_KEY = 'firebase_current_user_uid';

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
            plan: 'free',
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(FirebaseUser | null)[]>([]);
  const [appUsers, setAppUsers] = useState<(User | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAppUserData = async (firebaseUser: FirebaseUser) => {
    const appUserData = await getOrCreateAppUser(firebaseUser);
    setAppUser(appUserData);

    // Logic for multiple accounts
    const storedUsersRaw = localStorage.getItem('firebase_users') || '[]';
    const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    const userExists = storedUsers.some((u: any) => u.uid === firebaseUser.uid);

    if (!userExists) {
        storedUsers.push({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email, 
            displayName: firebaseUser.displayName, 
            photoURL: firebaseUser.photoURL 
        });
        localStorage.setItem('firebase_users', JSON.stringify(storedUsers));
    }

    const allStoredUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
    const firebaseUsers: FirebaseUser[] = allStoredUsers.map((u: any) => ({
        ...u,
        getIdToken: () => Promise.resolve(''),
    })) as FirebaseUser[];
    
    setUsers(firebaseUsers);
    
    const appUsersData = await Promise.all(
      firebaseUsers.map(u => getOrCreateAppUser(u))
    );
    setAppUsers(appUsersData);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        localStorage.setItem(CURRENT_USER_UID_KEY, firebaseUser.uid);
        setUser(firebaseUser);
        await fetchAppUserData(firebaseUser);
      } else {
        setUser(null);
        setAppUser(null);
        setUsers([]);
        setAppUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  const refreshAppUser = async () => {
    if (user) {
      const appUserData = await getOrCreateAppUser(user);
      setAppUser(appUserData);
    }
  }

  const switchUser = async (targetUser: FirebaseUser) => {
    setLoading(true);
    await firebaseSignOut(auth);
    // This is a simplified "re-login" for the prototype
    // In a real app you'd use credential management
    router.push(`/login?email=${encodeURIComponent(targetUser.email || '')}&autoLogin=true`);
  };

  const logout = async (redirect = true) => {
    const currentUserUid = user?.uid;
    await firebaseSignOut(auth);
    
    // Remove from multi-account list
    const allStoredUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
    const remainingUsers = allStoredUsers.filter((u: any) => u.uid !== currentUserUid);
    localStorage.setItem('firebase_users', JSON.stringify(remainingUsers));
    
    // Clear state
    setUser(null);
    setAppUser(null);
    setUsers([]);
    setAppUsers([]);

    if (redirect) {
      if (remainingUsers.length > 0) {
          // "Login" to the next available account
          router.push(`/login?email=${encodeURIComponent(remainingUsers[0].email || '')}&autoLogin=true`);
      } else {
          localStorage.removeItem('firebase_users');
          router.push('/login');
      }
    }
  };

  const value = { user, appUser, users, appUsers, loading, logout, switchUser, refreshAppUser };

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
