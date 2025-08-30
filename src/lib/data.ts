import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Post } from './types';

// NOTE: The data is now fetched from Firestore.

// --- User Functions ---

export async function getUsers(count: number = 10): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(count));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

export async function getUserById(id: string): Promise<User | undefined> {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        console.warn(`User with id ${id} not found.`);
        return undefined;
    }
    return { id: userSnap.id, ...userSnap.data() } as User;
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

export async function updateUserPlan(userId: string, plan: 'free' | 'premium' | 'premium_plus'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { plan });
}

// --- Post Functions ---

export async function getPosts(postIds?: string[]): Promise<Post[]> {
    const postsCol = collection(db, 'posts');
    let q;
    if (postIds && postIds.length > 0) {
        // Firestore 'in' query has a limit of 10 elements. For a real app, this would need a different approach.
        const limitedPostIds = postIds.slice(0, 10);
        q = query(postsCol, where('__name__', 'in', limitedPostIds));
    } else {
        q = query(postsCol, orderBy('createdAt', 'desc'), limit(50));
    }
     const postsSnapshot = await getDocs(q);
    
    // Manual sort because Firestore doesn't support orderBy with 'in' queries on different fields.
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    
    if(!postIds) return postsList;

    return postsList.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return dateB - dateA;
    });
}


export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
    if (!authorId) return [];
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return postsList;
}

export async function createPost(authorId: string, content: string): Promise<string> {
    const postsCol = collection(db, 'posts');
    const newPost = {
      authorId,
      content,
      createdAt: serverTimestamp(),
      likes: [],
      reposts: 0,
      replies: 0,
    };
    const docRef = await addDoc(postsCol, newPost);
    return docRef.id;
}

export async function updatePost(postId: string, content: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content });
}

export async function deletePost(postId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
}


export async function toggleLike(postId: string, userId: string) {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
        throw new Error("Post not found");
    }

    const post = postSnap.data() as Post;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
        await updateDoc(postRef, {
            likes: arrayRemove(userId)
        });
    } else {
        await updateDoc(postRef, {
            likes: arrayUnion(userId)
        });
    }
}


// --- Follow/Unfollow Functions ---

export async function followUser(currentUserId: string, targetUserId: string) {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
    });

    await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId)
    });
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
    });

    await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId)
    });
}
