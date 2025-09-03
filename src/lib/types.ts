
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
  bookmarks: string[]; // For posts not in any folder
  bookmarkFolders?: {
    id: string;
    name: string;
    postIds: string[];
  }[];
  isArtist: boolean;
  hasSeenStudioNotification: boolean;
  notificationSettings: {
    newFollowers: boolean;
    postLikes: boolean;
    postReplies: boolean;
    directMessages: boolean;
  }
}

export interface Post {
  id:string;
  authorId: string;
  content: string;
  tags?: string[];
  imageUrls?: string[];
  createdAt: Timestamp | string | { seconds: number, nanoseconds: number }; // Allow all possible shapes
  likes: string[]; // Array of user IDs who liked the post
  reposts: number;
  replies: number;
  repostedBy?: string[];
  parentPostId?: string; // ID of the post this is a reply to
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

export interface Track {
  id: string;
  title: string;
  artist: string; // Artist's display name
  artistId: string; // Artist's user ID
  artistUsername: string; // Artist's username for linking
  cover: string; // URL to cover art
  audioUrl: string; // URL to the audio file
  createdAt: Timestamp | { seconds: number, nanoseconds: number } | string;
}
