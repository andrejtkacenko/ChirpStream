import type { User, Post } from './types';

const users: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    username: 'alice',
    avatar: 'https://picsum.photos/id/1011/100/100',
    bio: 'Frontend Developer | React Enthusiast | Coffee Addict ☕️',
    following: ['user-2', 'user-3'],
    followers: ['user-2', 'user-4'],
  },
  {
    id: 'user-2',
    name: 'Bob Williams',
    username: 'bob',
    avatar: 'https://picsum.photos/id/1012/100/100',
    bio: 'Designer and dog lover. Exploring the intersection of technology and art.',
    following: ['user-1'],
    followers: ['user-1', 'user-3'],
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    username: 'charlie',
    avatar: 'https://picsum.photos/id/1025/100/100',
    bio: 'Just a person who loves to build cool things with code. Next.js is my jam.',
    following: ['user-2'],
    followers: ['user-1'],
  },
  {
    id: 'user-4',
    name: 'Diana Prince',
    username: 'diana',
    avatar: 'https://picsum.photos/id/1027/100/100',
    bio: 'UX/UI Designer creating seamless digital experiences. Cat person.',
    following: ['user-1'],
    followers: [],
  },
];

const posts: Post[] = [
    {
        id: 'post-1',
        authorId: 'user-2',
        content: 'Just shipped a new feature for our project! It feels great to see hard work pay off. Check it out: https://example.com',
        createdAt: '2024-07-29T10:00:00Z',
        likes: 12,
        reposts: 3,
        replies: 2,
    },
    {
        id: 'post-2',
        authorId: 'user-3',
        content: 'Working with Next.js Server Components is a game changer for performance. The learning curve is worth it!',
        createdAt: '2024-07-29T11:30:00Z',
        likes: 45,
        reposts: 15,
        replies: 7,
    },
    {
        id: 'post-3',
        authorId: 'user-1',
        content: "Trying out the new color palette for ChirpStream. What do you all think? I'm aiming for something modern and trustworthy. The primary is #7289DA.",
        createdAt: '2024-07-29T09:15:00Z',
        likes: 28,
        reposts: 5,
        replies: 10,
    },
    {
        id: 'post-4',
        authorId: 'user-2',
        content: 'My dog just did the funniest thing! I wish I had it on camera. 🐶',
        createdAt: '2024-07-28T18:45:00Z',
        likes: 150,
        reposts: 20,
        replies: 12,
    },
     {
        id: 'post-5',
        authorId: 'user-4',
        content: 'Good design is about making other designers feel like idiots because that idea wasn’t theirs.',
        createdAt: '2024-07-29T12:00:00Z',
        likes: 78,
        reposts: 22,
        replies: 9,
    },
];

export const currentUser = users[0];

export function getUsers(): User[] {
    return users;
}

export function getUserById(id: string): User | undefined {
    return users.find(user => user.id === id);
}

export function getUserByUsername(username: string): User | undefined {
    return users.find(user => user.username === username);
}

export function getPosts(): Post[] {
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPostsByAuthor(authorId: string): Post[] {
    return getPosts().filter(post => post.authorId === authorId);
}
