
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { deleteUserAccount } from '@/lib/data';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: User | null;
  isEmailVerified: boolean;
  users: (FirebaseUser | null)[];
  appUsers: (User | null)[];
  loading: boolean;
  logout: (redirect?: boolean) => void;
  switchUser: (user: FirebaseUser) => void;
  refreshAppUser: () => Promise<void>;
  deleteCurrentUserAccount: (password: string) => Promise<void>;
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
            isArtist: false,
            bookmarks: [],
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [users, setUsers] = useState<(FirebaseUser | null)[]>([]);
  const [appUsers, setAppUsers] = useState<(User | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAppUserData = async (firebaseUser: FirebaseUser) => {
    const appUserData = await getOrCreateAppUser(firebaseUser);
    setAppUser(appUserData);
    setIsEmailVerified(firebaseUser.emailVerified || firebaseUser.providerData.some(p => p.providerId === 'google.com'));

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
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const refreshAppUser = async () => {
    if (user && !isEmailVerified) {
      await user.reload(); // Get latest user data from Firebase Auth
      const updatedUser = auth.currentUser;
      if (updatedUser) {
        setUser(updatedUser);
        await fetchAppUserData(updatedUser);
      }
    }
     if (user) { // Also refresh app user data if needed
      const appUserData = await getOrCreateAppUser(user);
      setAppUser(appUserData);
    }
  }

  const switchUser = async (targetUser: FirebaseUser) => {
    setLoading(true);
    await firebaseSignOut(auth);
    router.push(`/login?email=${encodeURIComponent(targetUser.email || '')}&autoLogin=true`);
  };
  
  const handleLogoutCleanup = (userIdToClear?: string) => {
    const currentUserUid = userIdToClear || user?.uid;
    // Remove from multi-account list
    const allStoredUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
    const remainingUsers = allStoredUsers.filter((u: any) => u.uid !== currentUserUid);
    localStorage.setItem('firebase_users', JSON.stringify(remainingUsers));
    
    // Clear state
    setUser(null);
    setAppUser(null);
    setUsers([]);
    setAppUsers([]);

    if (remainingUsers.length > 0) {
        router.push(`/login?email=${encodeURIComponent(remainingUsers[0].email || '')}&autoLogin=true`);
    } else {
        localStorage.removeItem('firebase_users');
        router.push('/login');
    }
  }

  const logout = async (redirect = true) => {
    const currentUserUid = user?.uid;
    await firebaseSignOut(auth);
    if (redirect) {
      handleLogoutCleanup(currentUserUid);
    }
  };

  const deleteCurrentUserAccount = async (password: string) => {
    if (!user || !user.email) {
      throw new Error("No user is logged in or user has no email.");
    }
    
    const userId = user.uid;

    // 1. Re-authenticate
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // 2. Delete all Firestore data
    await deleteUserAccount(userId);

    // 3. Delete Firebase Auth user
    await deleteUser(user);

    // 4. Clean up local state and redirect
    handleLogoutCleanup(userId);
  };


  const value = { user, appUser, isEmailVerified, users, appUsers, loading, logout, switchUser, refreshAppUser, deleteCurrentUserAccount };

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
