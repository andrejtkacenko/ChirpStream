"use client";

import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Separator } from "@/components/ui/separator";
import { getPosts, getUserById } from "@/lib/data";
import type { Post } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { appUser, loading } = useAuth();
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      if (!appUser) return;
      setFeedLoading(true);
      const followedUserIds = appUser.following;
      const allPosts = await getPosts();
      const posts = allPosts.filter(post => followedUserIds.includes(post.authorId) || post.authorId === appUser.id);
      setFeedPosts(posts);
      setFeedLoading(false);
    }
    
    if (!loading && appUser) {
      loadFeed();
    } else if (!loading && !appUser) {
      setFeedLoading(false);
    }
  }, [appUser, loading]);


  return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 p-4 md:p-6">
        <main>
          <h1 className="text-2xl font-bold mb-4">Home</h1>
          <CreatePostForm />
          <Separator className="my-6" />
          {feedLoading ? <FeedSkeleton /> : (
            <div className="flex flex-col gap-6">
              {feedPosts.map(async (post: Post) => {
                const author = await getUserById(post.authorId);
                if (!author) return null;
                return <PostCard key={post.id} post={post} author={author} />;
              })}
            </div>
          )}
        </main>
        <aside className="hidden xl:block">
          <RightSidebar />
        </aside>
      </div>
    </ProtectedRoute>
  );
}