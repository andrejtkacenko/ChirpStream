"use client";

import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { getPosts, getUserById } from "@/lib/data";
import type { Post, User } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-start gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

type HydratedPost = Post & { author: User };

function HomePageContent() {
  const { appUser, loading: authLoading } = useAuth();
  const [feedPosts, setFeedPosts] = useState<HydratedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    if (!appUser) return;

    setFeedLoading(true);
    const userIdsForFeed = [...(appUser.following || []), appUser.id];
    
    // In a real-world high-scale app, this would be a single denormalized query
    // or a more complex backend service. For this app, we fetch posts and then authors.
    const allPosts = await getPosts();
    const relevantPosts = allPosts.filter(post => userIdsForFeed.includes(post.authorId));

    const hydratedPosts = await Promise.all(
      relevantPosts.map(async (post) => {
        const author = await getUserById(post.authorId);
        // It's possible an author was deleted, so we filter those out.
        return author ? { ...post, author } : null;
      })
    );

    setFeedPosts(hydratedPosts.filter(Boolean) as HydratedPost[]);
    setFeedLoading(false);
  }, [appUser]);

  useEffect(() => {
    if (!authLoading && appUser) {
      loadFeed();
    } else if (!authLoading && !appUser) {
      setFeedLoading(false);
    }
  }, [appUser, authLoading, loadFeed]);


  return (
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
        <main>
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Home</h1>
          </div>
          <CreatePostForm />
          {feedLoading ? <FeedSkeleton /> : (
            <div className="flex flex-col">
              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                    <PostCard key={post.id} post={post} author={post.author} />
                ))
              ) : (
                <p className="text-muted-foreground text-center p-8">
                  Your feed is empty. Follow some people to see their posts!
                </p>
              )}
            </div>
          )}
        </main>
        <aside className="hidden xl:block pt-6 pr-6">
          <RightSidebar />
        </aside>
      </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  )
}
