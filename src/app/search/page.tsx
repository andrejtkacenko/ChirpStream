
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/chirpstream/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchPosts, searchUsers, followUser, unfollowUser } from "@/lib/data";
import type { PostWithAuthor, User } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";


function UserResultCard({ user }: { user: User }) {
  const { appUser: currentUser, loading, refreshAppUser } = useAuth();
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
      // Refresh the current user's state to reflect the change in following list
      await refreshAppUser();
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
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-4 mt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}


function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "";
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchResults = useCallback(async () => {
    if (!query) {
        setPosts([]);
        setUsers([]);
        setLoading(false);
        return;
    };
    if (!authUser) return;
    
    setLoading(true);
    
    // Perform searches in parallel
    const [foundPosts, foundUsers] = await Promise.all([
      searchPosts(query),
      searchUsers(query)
    ]);

    setPosts(foundPosts);
    setUsers(foundUsers);
    setLoading(false);
  }, [query, authUser]);

  useEffect(() => {
    if (!authLoading) {
      fetchResults();
    }
  }, [query, authLoading, fetchResults]);

  if (authLoading) {
      return <SearchSkeleton />;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold">Search results</h1>
       <p className="text-muted-foreground">Showing results for "{query}"</p>
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {loading ? <SearchSkeleton /> : (
            <div className="flex flex-col gap-6 mt-4">
                {posts.length > 0 ? (
                posts.map(post => (
                    <PostCard key={post.id} post={post} author={post.author} />
                ))
                ) : (
                <p className="text-muted-foreground text-center py-8">No posts found matching your search.</p>
                )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="users">
          {loading ? <SearchSkeleton /> : (
            <div className="flex flex-col gap-4 mt-4">
                {users.length > 0 ? (
                users.map(user => <UserResultCard key={user.id} user={user} />)
                ) : (
                <p className="text-muted-foreground text-center py-8">No users found matching your search.</p>
                )}
            </div>
          )}
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
