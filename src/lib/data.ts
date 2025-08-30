import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Post } from './types';

// NOTE: The data is now fetched from Firestore.
// The mock data has been removed. We will need to add a way to populate the database.

export async function getUsers(count: number = 10): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(count));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

export async function getUserById(id: string): Promise<User | undefined> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('id', '==', id), limit(1));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return undefined;
    }
    const userData = userSnapshot.docs[0].data();
    return { id: userSnapshot.docs[0].id, ...userData } as User;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('username', '==', username), limit(1));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
        return undefined;
    }
    const userData = userSnapshot.docs[0].data();
    return { id: userSnapshot.docs[0].id, ...userData } as User;
}

export async function getPosts(): Promise<Post[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return postsList;
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return postsList;
}

// currentUser is now handled by AuthContext, this is an example of how you might get it
// but it's better to use the context in components.
export async function getCurrentUser(userId: string): Promise<User | undefined> {
    return await getUserById(userId);
}
