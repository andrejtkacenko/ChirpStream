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
  createdAt: Timestamp | string; // Allow both for client-side creation and server-side fetching
  likes: string[]; // Array of user IDs who liked the post
  reposts: number;
  replies: number;
}
