
import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  following: string[];
  followers: string[];
  plan: 'free' | 'premium' | 'premium_plus';
  bookmarks: string[];
}

export interface Post {
  id:string;
  authorId: string;
  content: string;
  imageUrls?: string[];
  createdAt: Timestamp | string | { seconds: number, nanoseconds: number }; // Allow all possible shapes
  likes: string[]; // Array of user IDs who liked the post
  reposts: number;
  replies: number;
  repostedBy?: string[];
}

export type PostWithAuthor = Post & { author: User };


export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Timestamp | string;
    };
    // Hydrated fields
    participantDetails: User[]; 
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp | { seconds: number, nanoseconds: number } | string;
     // Hydrated fields
    sender?: User;
    likes: string[];
    replies: number;
    reposts: number;
}

export interface Notification {
  id: string;
  userId: string; // The user receiving the notification
  actorId: string; // The user who performed the action
  type: 'follow' | 'like' | 'reply' | 'repost';
  postId?: string; // The post related to the notification
  createdAt: Timestamp;
  read: boolean;
  // Hydrated fields
  actor?: User;
  post?: PostWithAuthor;
}
