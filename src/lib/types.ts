
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
}

export interface Post {
  id:string;
  authorId: string;
  content: string;
  createdAt: Timestamp | string | { seconds: number, nanoseconds: number }; // Allow all possible shapes
  likes: string[]; // Array of user IDs who liked the post
  reposts: number;
  replies: number;
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
}
