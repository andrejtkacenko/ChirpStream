




import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, writeBatch, documentId, collectionGroup, Timestamp, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Post, PostWithAuthor, Conversation, Message, Notification } from './types';

// --- User Functions ---

// Helper to hydrate posts with author data
async function hydratePosts(posts: Post[]): Promise<PostWithAuthor[]> {
    if (posts.length === 0) {
        return [];
    }

    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const users = await getUsersByIds(authorIds);
    const usersMap = new Map(users.map(u => [u.id, u]));
    
    return posts.map(post => {
        const author = usersMap.get(post.authorId);
        return author ? { ...post, author } : null;
    }).filter((p): p is PostWithAuthor => p !== null);
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    
    const users: User[] = [];
    const batches: Promise<any>[] = [];

    // Firestore 'in' query has a limit of 30 items.
    for (let i = 0; i < ids.length; i += 30) {
        const batchIds = ids.slice(i, i + 30);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where(documentId(), 'in', batchIds));
        batches.push(getDocs(q));
    }
    
    const userSnapshots = await Promise.all(batches);
    userSnapshots.forEach(userSnapshot => {
        userSnapshot.forEach((doc: any) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
    });

    return users;
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

export async function updateUserProfile(
    userId: string, 
    data: { 
        name?: string; 
        username?: string; 
        bio?: string; 
        avatar?: string; 
        isArtist?: boolean; 
        hasSeenStudioNotification?: boolean 
    }
): Promise<void> {
    // Check for username uniqueness if it's being changed
    if (data.username) {
        const existingUser = await getUserByUsername(data.username);
        if (existingUser && existingUser.id !== userId) {
            throw new Error("Username already exists.");
        }
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
}

export async function markStudioNotificationAsSeen(userId: string): Promise<void> {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { hasSeenStudioNotification: true });
}

// --- Post Functions ---

export async function getPost(id: string): Promise<Post | null> {
    const postRef = doc(db, 'posts', id);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
        return null;
    }
    return { id: postSnap.id, ...postSnap.data() } as Post;
}


export async function getPosts(count: number = 50): Promise<PostWithAuthor[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(count));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return hydratePosts(postsList);
}

export async function getPostsByIds(ids: string[]): Promise<PostWithAuthor[]> {
    if (ids.length === 0) return [];
    
    const posts: Post[] = [];
    const batches: Promise<any>[] = [];

    // Firestore 'in' query has a limit of 30 items.
    for (let i = 0; i < ids.length; i += 30) {
        const batchIds = ids.slice(i, i + 30);
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where(documentId(), 'in', batchIds));
        batches.push(getDocs(q));
    }
    
    const postSnapshots = await Promise.all(batches);
    postSnapshots.forEach(postSnapshot => {
        postSnapshot.forEach((doc: any) => {
            posts.push({ id: doc.id, ...doc.data() } as Post);
        });
    });

    // Sort by original ID order's reverse, as that's probably chronological
    const sortedPosts = posts.sort((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id));

    return hydratePosts(sortedPosts);
}


export async function getBookmarkedPosts(userId: string): Promise<PostWithAuthor[]> {
    const user = await getUserById(userId);
    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
        return [];
    }
    return getPostsByIds(user.bookmarks);
}

export async function getPostsForFeed(userId: string): Promise<PostWithAuthor[]> {
    const user = await getUserById(userId);
    if (!user) return [];
    
    const authorIds = [...user.following, userId];
    if (authorIds.length === 0) return [];
    
    const posts: Post[] = [];
    const batches = [];
    // Firestore 'in' query has a limit of 30 items in this version of the SDK.
    for (let i = 0; i < authorIds.length; i += 30) {
        const batchIds = authorIds.slice(i, i + 30);
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('authorId', 'in', batchIds));
        batches.push(getDocs(q));
    }
    
    const postSnapshots = await Promise.all(batches);
    postSnapshots.forEach(snapshot => {
         snapshot.docs.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() } as Post)
        })
    });

    posts.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as string).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as string).getTime();
        return dateB - dateA;
    });

    return hydratePosts(posts.slice(0, 50));
}


export async function getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
    if (!authorId) return [];
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    return hydratePosts(postsList);
}

export async function createPost(authorId: string, content: string, imageUrls?: string[]): Promise<string> {
    const postsCol = collection(db, 'posts');
    const newPost: Omit<Post, 'id' | 'createdAt'> = {
      authorId,
      content,
      likes: [],
      reposts: 0,
      replies: 0,
      repostedBy: [],
    };

    if (imageUrls && imageUrls.length > 0) {
      newPost.imageUrls = imageUrls;
    }

    const docRef = await addDoc(postsCol, {
        ...newPost,
        createdAt: serverTimestamp()
    });
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

    const postData = postSnap.data();
    const postLikes = postData.likes || [];
    const isLiked = postLikes.includes(userId);

    if (isLiked) {
        await updateDoc(postRef, {
            likes: arrayRemove(userId)
        });
        // Optionally, remove the notification
    } else {
        await updateDoc(postRef, {
            likes: arrayUnion(userId)
        });
         // Create notification only if someone else's post is liked
        if (postData.authorId !== userId) {
            await createNotification(postData.authorId, userId, 'like', postId);
        }
    }
}

export async function toggleBookmark(postId: string, userId: string) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error("User not found");
    }

    const userData = userSnap.data();
    const bookmarks = userData.bookmarks || [];
    const isBookmarked = bookmarks.includes(postId);

    if (isBookmarked) {
        await updateDoc(userRef, {
            bookmarks: arrayRemove(postId)
        });
    } else {
        await updateDoc(userRef, {
            bookmarks: arrayUnion(postId)
        });
    }
}


export async function repostPost(postId: string, userId: string, doRepost: boolean): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    
    await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
            throw "Post does not exist!";
        }

        const repostedBy = postDoc.data().repostedBy || [];
        const isReposted = repostedBy.includes(userId);

        if (doRepost && !isReposted) {
             transaction.update(postRef, { 
                reposts: increment(1),
                repostedBy: arrayUnion(userId)
             });
        } else if (!doRepost && isReposted) {
            transaction.update(postRef, { 
                reposts: increment(-1),
                repostedBy: arrayRemove(userId)
            });
        }
    });
}


// --- Follow/Unfollow Functions ---

export async function followUser(currentUserId: string, targetUserId: string) {
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    batch.update(currentUserRef, { following: arrayUnion(targetUserId) });
    batch.update(targetUserRef, { followers: arrayUnion(currentUserId) });
    
    await batch.commit();

    await createNotification(targetUserId, currentUserId, 'follow');
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    batch.update(currentUserRef, { following: arrayRemove(targetUserId) });
    batch.update(targetUserRef, { followers: arrayRemove(currentUserId) });
    
    await batch.commit();

    // Optionally, remove the follow notification
}

// --- Search Functions ---

export async function searchUsers(searchTerm: string): Promise<User[]> {
  if (!searchTerm) return [];
  const lowerCaseTerm = searchTerm.toLowerCase();
  
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
    const allPosts = await getPosts(200); 
    const lowerCaseTerm = searchTerm.toLowerCase();

    const filteredPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(lowerCaseTerm)
    );

    return filteredPosts;
}


// --- Messaging Functions ---

export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
    const convRef = collection(db, 'conversations');
    const q = query(convRef, where('participants', 'array-contains', userId), orderBy('lastMessage.timestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Conversation));

    for (const conv of conversations) {
        conv.participantDetails = await getUsersByIds(conv.participants);
    }
    
    return conversations;
}

export function getMessagesForConversation(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach(doc => {
            messages.push({
                id: doc.id,
                ...doc.data()
            } as Message)
        });

        const senderIds = [...new Set(messages.map(m => m.senderId))];
        if(senderIds.length === 0) {
            callback(messages);
            return;
        }

        const senders = await getUsersByIds(senderIds);
        const sendersMap = new Map(senders.map(s => [s.id, s]));

        const hydratedMessages = messages.map(msg => ({
            ...msg,
            sender: sendersMap.get(msg.senderId)
        }));

        callback(hydratedMessages);
    });

    return unsubscribe;
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
    const convRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(convRef);
    if (!docSnap.exists()) return null;

    const conv = { id: docSnap.id, ...docSnap.data() } as Conversation;
    conv.participantDetails = await getUsersByIds(conv.participants);
    return conv;
}


export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    const timestamp = serverTimestamp();

    const newMessage = {
        senderId,
        text,
        createdAt: timestamp,
        likes: [],
        replies: 0,
        reposts: 0,
    };

    await addDoc(messagesRef, newMessage);
    
    await updateDoc(conversationRef, {
        lastMessage: {
            text,
            senderId,
            timestamp: timestamp
        }
    });
}

export async function findOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    const conversationsRef = collection(db, 'conversations');
    
    const q = query(conversationsRef, where('participants', '==', [userId1, userId2].sort()));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }

    const newConversation = {
        participants: [userId1, userId2].sort(),
        createdAt: serverTimestamp(),
        lastMessage: null,
    };
    const docRef = await addDoc(conversationsRef, newConversation);
    return docRef.id;
}


// --- Notification Functions ---

export async function createNotification(userId: string, actorId: string, type: Notification['type'], postId?: string): Promise<void> {
    if (userId === actorId) return; // Don't notify for your own actions

    const notificationCol = collection(db, 'notifications');
    const newNotification: Omit<Notification, 'id' | 'createdAt'> = {
        userId,
        actorId,
        type,
        read: false,
        ...(postId && { postId }),
    };

    await addDoc(notificationCol, {
        ...newNotification,
        createdAt: serverTimestamp()
    });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), limit(50));
    
    const snapshot = await getDocs(q);
    let notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

    // client-side sort
    notifications.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime();
        return dateB - dateA;
    });

    // Hydrate with actor and post info
    const actorIds = [...new Set(notifications.map(n => n.actorId))];
    const postIds = [...new Set(notifications.filter(n => n.postId).map(n => n.postId))] as string[];
    
    const [actors, posts] = await Promise.all([
        getUsersByIds(actorIds),
        postIds.length > 0 ? getPostsByIds(postIds) : Promise.resolve([])
    ]);
    
    const actorsMap = new Map(actors.map(a => [a.id, a]));
    const postsMap = new Map(posts.map(p => [p.id, p]));

    return notifications.map(n => ({
        ...n,
        actor: actorsMap.get(n.actorId),
        post: n.postId ? postsMap.get(n.postId) : undefined
    }));
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('read', '==', false));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });

    await batch.commit();
}
