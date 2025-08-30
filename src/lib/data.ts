
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, writeBatch, documentId, collectionGroup } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Post, PostWithAuthor } from './types';
import { Timestamp } from 'firebase/firestore';

// --- User Functions ---

// Helper to hydrate posts with author data
async function hydratePosts(posts: Post[]): Promise<PostWithAuthor[]> {
    if (posts.length === 0) {
        return [];
    }

    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const users: Record<string, User> = {};

    // Firestore 'in' queries are limited to 30 elements.
    // We need to fetch author data in batches.
    const batches = [];
    for (let i = 0; i < authorIds.length; i += 30) {
        const batchIds = authorIds.slice(i, i + 30);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where(documentId(), 'in', batchIds));
        batches.push(getDocs(q));
    }

    const userSnapshots = await Promise.all(batches);
    for (const userSnapshot of userSnapshots) {
        userSnapshot.forEach(doc => {
            users[doc.id] = { id: doc.id, ...doc.data() } as User;
        });
    }
    
    return posts.map(post => ({
        ...post,
        author: users[post.authorId]
    })).filter(p => p.author); // Filter out posts where author might not have been found
}


export async function getUsers(count: number = 10): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(count));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

export async function getUserById(id: string): Promise<User | undefined> {
    if (!id) return undefined;
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

// Gets all posts for the explore page
export async function getPosts(count: number = 50): Promise<PostWithAuthor[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(count));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return hydratePosts(postsList);
}

// Gets posts for a user's feed (their posts + posts from people they follow)
export async function getPostsForFeed(userId: string): Promise<PostWithAuthor[]> {
    const user = await getUserById(userId);
    if (!user) return [];
    
    const authorIds = [...user.following, userId];
    if (authorIds.length === 0) return [];
    
    // Firestore 'in' query has a limit of 30, so we batch it
    const posts: Post[] = [];
    const batches = [];
    for (let i = 0; i < authorIds.length; i += 30) {
        const batchIds = authorIds.slice(i, i + 30);
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('authorId', 'in', batchIds), orderBy('createdAt', 'desc'), limit(50));
        batches.push(getDocs(q));
    }
    
    const postSnapshots = await Promise.all(batches);
    postSnapshots.forEach(snapshot => {
         snapshot.docs.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() } as Post)
        })
    });

    // Sort manually as Firestore doesn't guarantee order with 'in' queries
    posts.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as string).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as string).getTime();
        return dateB - dateA;
    });

    return hydratePosts(posts);
}


export async function getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
    if (!authorId) return [];
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return hydratePosts(postsList);
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
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    batch.update(currentUserRef, { following: arrayUnion(targetUserId) });
    batch.update(targetUserRef, { followers: arrayUnion(currentUserId) });
    
    await batch.commit();
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    batch.update(currentUserRef, { following: arrayRemove(targetUserId) });
    batch.update(targetUserRef, { followers: arrayRemove(currentUserId) });
    
    await batch.commit();
}

// --- Search Functions ---

export async function searchUsers(searchTerm: string): Promise<User[]> {
  if (!searchTerm) return [];
  const lowerCaseTerm = searchTerm.toLowerCase();
  
  // This is a very basic prefix search. 
  // For a real-world app, a dedicated search service like Algolia or Elasticsearch is recommended.
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('username', '>=', lowerCaseTerm),
    where('username', '<=', lowerCaseTerm + '\uf8ff'),
    limit(10)
  );

  const userSnapshot = await getDocs(q);
  if (userSnapshot.empty) return [];
  
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function searchPosts(searchTerm: string): Promise<PostWithAuthor[]> {
    if (!searchTerm) return [];

    // Firestore does not support native full-text search. 
    // This is a workaround and is NOT scalable.
    // A real app would use a service like Algolia or Elasticsearch.
    const allPosts = await getPosts(200); // Get a large number of recent posts
    const lowerCaseTerm = searchTerm.toLowerCase();

    const filteredPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(lowerCaseTerm)
    );

    return filteredPosts;
}
