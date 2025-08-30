export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  following: string[];
  followers: string[];
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
  reposts: number;
  replies: number;
}
