
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
  const [users, setUsers] = useState<(FirebaseUser | null)[]>([]);
  const [appUsers, setAppUsers] = useState<(User | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        // This is the currently signed in user
        setUser(firebaseUser);
        const appUserData = await getOrCreateAppUser(firebaseUser);
        setAppUser(appUserData);

        // Logic for multiple accounts
        const storedUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
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

        // We can't store full FirebaseUser objects in localStorage, so we store identifiers
        // and "rehydrate" them. For this simple case, we'll just get all users again.
        const allStoredUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const firebaseUsers: FirebaseUser[] = allStoredUsers.map((u: any) => ({
            ...u,
            // Re-add essential methods that are not in JSON
            getIdToken: () => Promise.resolve(''),
        })) as FirebaseUser[];
        
        setUsers(firebaseUsers);
        
        const appUsersData = await Promise.all(
          firebaseUsers.map(u => getOrCreateAppUser(u))
        );
        setAppUsers(appUsersData);

      } else {
        setUser(null);
        setAppUser(null);
        setUsers([]);
        setAppUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchUser = async (targetUser: FirebaseUser) => {
    // In a real multi-auth scenario, you'd use credentials or re-authentication
    // to switch. For this prototype, we'll simulate by just setting the active user
    // if they are in our list. This is not a real sign-in operation.
    const userToSwitch = users.find(u => u?.uid === targetUser.uid);
    if (userToSwitch) {
        await firebaseSignOut(auth);
        // This is a simplified login flow for the prototype
        // In a real app, you would need to re-authenticate properly
        router.push(`/login?email=${userToSwitch.email}`);
    }
  };

  const logout = async (redirect = true) => {
    const currentUserUid = user?.uid;
    await firebaseSignOut(auth);
    
    const allStoredUsers = JSON.parse(localStorage.getItem('firebase_users') || '[]');
    const remainingUsers = allStoredUsers.filter((u: any) => u.uid !== currentUserUid);
    localStorage.setItem('firebase_users', JSON.stringify(remainingUsers));
    
    if (redirect) {
        if (remainingUsers.length > 0) {
            router.push(`/login?email=${remainingUsers[0].email}`);
        } else {
            router.push('/login');
        }
    }
    // Reset state
    setUser(null);
    setAppUser(null);
    setUsers([]);
    setAppUsers([]);
  };

  const value = { user, appUser, users, appUsers, loading, logout, switchUser };

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
