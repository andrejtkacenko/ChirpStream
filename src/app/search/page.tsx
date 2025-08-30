
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/chirpstream/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPosts, getUsers, getUserById, followUser, unfollowUser } from "@/lib/data";
import type { Post, User } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";


function UserResultCard({ user }: { user: User }) {
  const { appUser: currentUser, loading } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentUser = user.id === currentUser?.id;

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(user.id));
    }
  }, [currentUser, user.id]);

  const toggleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Please login to follow users.", variant: "destructive" });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, user.id);
        setIsFollowing(false);
      } else {
        await followUser(currentUser.id, user.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <Link href={`/${user.username}`} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold hover:underline">{user.name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
        {!isCurrentUser && (
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              onClick={toggleFollow}
              disabled={loading || isProcessing}
            >
              {isProcessing ? "..." : isFollowing ? "Following" : "Follow"}
            </Button>
          )}
      </CardContent>
    </Card>
  );
}

function SearchSkeleton() {
    return (
        <div className="p-4 md:p-6">
            <div className="space-y-2 mb-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

type HydratedPost = Post & { author: User };

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "";
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<HydratedPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchResults() {
        if (!query || !authUser) return;
        setLoading(true);
        const allPosts = await getPosts();
        const allUsers = await getUsers();

        const lowerCaseQuery = query.toLowerCase();

        const filteredPosts = allPosts.filter(post =>
            post.content.toLowerCase().includes(lowerCaseQuery)
        );

        const hydratedPosts = await Promise.all(
          filteredPosts.map(async (post) => {
            const author = await getUserById(post.authorId);
            return author ? { ...post, author } : null;
          })
        );
        
        const filteredUsers = allUsers.filter(user =>
            user.name.toLowerCase().includes(lowerCaseQuery) ||
            user.username.toLowerCase().includes(lowerCaseQuery)
        );

        setPosts(hydratedPosts.filter(Boolean) as HydratedPost[]);
        setUsers(filteredUsers);
        setLoading(false);
    }
    if (!authLoading) {
      fetchResults();
    }
  }, [query, authUser, authLoading]);

  if (loading || authLoading) {
      return <SearchSkeleton />;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold">Search results for "{query}"</h1>
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="flex flex-col gap-6 mt-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} author={post.author} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No posts found.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="flex flex-col gap-4 mt-4">
            {users.length > 0 ? (
              users.map(user => <UserResultCard key={user.id} user={user} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SearchPage() {
    return (
        <ProtectedRoute>
            <SearchPageContent />
        </ProtectedRoute>
    )
}
