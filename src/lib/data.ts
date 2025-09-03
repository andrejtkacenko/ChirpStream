

import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, writeBatch, documentId, collectionGroup, Timestamp, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { db } from './firebase';
import type { User, Post, PostWithAuthor, Conversation, Message, Notification, Track } from './types';

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
    data: Partial<Pick<User, 'name' | 'username' | 'bio' | 'avatar' | 'isArtist' | 'hasSeenStudioNotification' | 'notificationSettings'>>
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
    if (!user) {
        return [];
    }
    
    const allBookmarkedIds = [...(user.bookmarks || [])];
    if (user.bookmarkFolders) {
        user.bookmarkFolders.forEach(folder => {
            allBookmarkedIds.push(...folder.postIds);
        });
    }

    if (allBookmarkedIds.length === 0) {
        return [];
    }
    
    return getPostsByIds([...new Set(allBookmarkedIds)]);
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

export async function createPost(authorId: string, content: string, tags: string[], imageUrls?: string[], parentPostId?: string): Promise<string> {
    const batch = writeBatch(db);
    const postsCol = collection(db, 'posts');
    const newPostRef = doc(postsCol); // Create a reference with a new ID

    const newPostData: Omit<Post, 'id' | 'createdAt'> = {
      authorId,
      content,
      tags: tags,
      likes: [],
      reposts: 0,
      replies: 0,
      repostedBy: [],
      ...(parentPostId && { parentPostId }),
      ...(imageUrls && imageUrls.length > 0 && { imageUrls }),
    };

    batch.set(newPostRef, {
        ...newPostData,
        createdAt: serverTimestamp()
    });

    if (parentPostId) {
        const parentPostRef = doc(db, 'posts', parentPostId);
        batch.update(parentPostRef, { replies: increment(1) });

        // Create notification for reply
        const parentPostSnap = await getDoc(parentPostRef);
        if (parentPostSnap.exists()) {
            const parentPostData = parentPostSnap.data();
            if (parentPostData.authorId !== authorId) {
                // We are not awaiting this, it's a fire-and-forget
                createNotification(parentPostData.authorId, authorId, 'reply', parentPostId);
            }
        }
    }

    await batch.commit();
    return newPostRef.id;
}


export async function updatePost(postId: string, data: { content?: string, imageUrls?: string[], tags?: string[] }): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, data);
}

export async function deletePost(postId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
}

export async function getPostWithReplies(postId: string): Promise<{ post: PostWithAuthor, replies: PostWithAuthor[] } | null> {
    const postData = await getPost(postId);
    if (!postData) return null;

    const [hydratedPost] = await hydratePosts([postData]);
    if (!hydratedPost) return null;

    const repliesRef = collection(db, 'posts');
    // The query causing the index issue was here. Now we just filter.
    const q = query(repliesRef, where('parentPostId', '==', postId));
    const repliesSnapshot = await getDocs(q);
    const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    // Sort on the client-side
    replies.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as string).getTime();
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as string).getTime();
        return dateB - dateA;
    });

    const hydratedReplies = await hydratePosts(replies);

    return {
        post: hydratedPost,
        replies: hydratedReplies
    }
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
    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data() as User;

    const allBookmarkIds = [
        ...(userData.bookmarks || []),
        ...(userData.bookmarkFolders || []).flatMap(f => f.postIds)
    ];

    if (allBookmarkIds.includes(postId)) {
        // Post is bookmarked, so remove it from wherever it is.
        const batch = writeBatch(db);

        // From root bookmarks
        if (userData.bookmarks?.includes(postId)) {
            batch.update(userRef, { bookmarks: arrayRemove(postId) });
        }
        
        // From folders
        if (userData.bookmarkFolders) {
            const updatedFolders = userData.bookmarkFolders.map(folder => ({
                ...folder,
                postIds: folder.postIds.filter(id => id !== postId)
            }));
            batch.update(userRef, { bookmarkFolders: updatedFolders });
        }
        await batch.commit();

    } else {
        // Post is not bookmarked, add it to the root bookmarks.
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
    batch.update(targetUserRef, { followers: arrayRemove(targetUserId) });
    
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
    
    const cleanedSearchTerm = searchTerm.startsWith('#') ? searchTerm.substring(1) : searchTerm;
    const lowerCaseTerm = cleanedSearchTerm.toLowerCase();
    
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('tags', 'array-contains', lowerCaseTerm), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    
    return hydratePosts(postsList);
}


// --- Messaging Functions ---

export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
    const convRef = collection(db, 'conversations');
    const q = query(convRef, where('participants', 'array-contains', userId));
    
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Conversation));

    // Client-side sort
    conversations.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp;
        const timeB = b.lastMessage?.timestamp;
        if (!timeA || !timeB) return 0;
        const dateA = timeA instanceof Timestamp ? timeA.toMillis() : new Date(timeA as any).getTime();
        const dateB = timeB instanceof Timestamp ? timeB.toMillis() : new Date(timeB as any).getTime();
        return dateB - dateA;
    });

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


// --- Music / Track Functions ---

export async function addTrack({ artistId, artistName, artistUsername, trackName }: { artistId: string, artistName: string, artistUsername: string, trackName: string }): Promise<string> {
    const tracksCol = collection(db, 'tracks');
    
    const newTrack: Omit<Track, 'id'> = {
        artistId,
        artist: artistName,
        artistUsername,
        title: trackName,
        cover: `https://picsum.photos/seed/${trackName.replace(/\s+/g, '')}/400/400`, // Use track name for a unique-ish seed
        audioUrl: "https://storage.googleapis.com/studiostoragetest/Lullaby.mp3", // Placeholder audio
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(tracksCol, newTrack);
    return docRef.id;
}

export async function getTracks(count: number = 50): Promise<Track[]> {
    const tracksCol = collection(db, 'tracks');
    const q = query(tracksCol, orderBy('createdAt', 'desc'), limit(count));
    const tracksSnapshot = await getDocs(q);
    return tracksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Track));
}

export async function getTracksByArtist(artistId: string): Promise<Track[]> {
    const tracksCol = collection(db, 'tracks');
    const q = query(tracksCol, where('artistId', '==', artistId));
    const tracksSnapshot = await getDocs(q);
    const tracks = tracksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Track));
    
    // Sort on the client side
    tracks.sort((a, b) => {
        const timeA = a.createdAt;
        const timeB = b.createdAt;
        if (!timeA || !timeB) return 0;
        const dateA = timeA instanceof Timestamp ? timeA.toMillis() : new Date(timeA as any).getTime();
        const dateB = timeB instanceof Timestamp ? timeB.toMillis() : new Date(timeB as any).getTime();
        return dateB - dateA;
    });

    return tracks;
}

// --- Bookmark Folder Functions ---
export async function createBookmarkFolder(userId: string, folderName: string): Promise<void> {
    const userRef = doc(db, "users", userId);
    const newFolder = {
        id: doc(collection(db, 'users')).id, // Generate a unique ID
        name: folderName,
        postIds: [],
    };
    await updateDoc(userRef, {
        bookmarkFolders: arrayUnion(newFolder)
    });
}

export async function movePostToBookmarkFolder(userId: string, postId: string, fromFolderId: string | 'root', toFolderId: string | 'root'): Promise<void> {
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User does not exist!";
        
        const userData = userDoc.data() as User;
        const bookmarks = userData.bookmarks || [];
        const bookmarkFolders = userData.bookmarkFolders || [];

        // Remove from the source
        if (fromFolderId === 'root') {
            const index = bookmarks.indexOf(postId);
            if (index > -1) bookmarks.splice(index, 1);
        } else {
            const folder = bookmarkFolders.find(f => f.id === fromFolderId);
            if (folder) {
                const index = folder.postIds.indexOf(postId);
                if (index > -1) folder.postIds.splice(index, 1);
            }
        }

        // Add to the destination
        if (toFolderId === 'root') {
            if (!bookmarks.includes(postId)) bookmarks.push(postId);
        } else {
            const folder = bookmarkFolders.find(f => f.id === toFolderId);
            if (folder && !folder.postIds.includes(postId)) {
                folder.postIds.push(postId);
            }
        }
        
        transaction.update(userRef, { bookmarks, bookmarkFolders });
    });
}


export async function toggleMessageLike(conversationId: string, messageId: string, userId: string) {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    
    await runTransaction(db, async (transaction) => {
        const messageDoc = await transaction.get(messageRef);
        if (!messageDoc.exists()) throw "Message does not exist!";

        const messageData = messageDoc.data();
        const likes = messageData.likes || [];
        const isLiked = likes.includes(userId);

        if (isLiked) {
            transaction.update(messageRef, { likes: arrayRemove(userId) });
        } else {
            transaction.update(messageRef, { likes: arrayUnion(userId) });
        }
    });
}
