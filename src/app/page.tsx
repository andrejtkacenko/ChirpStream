

"use client";

import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { getPostsForFeed } from "@/lib/data";
import type { PostWithAuthor } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/main-layout";

function FeedSkeleton() {
  return (
    <div className="flex flex-col">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-start gap-4 p-4 border-b">
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


function HomePageContent() {
  const { appUser, loading: authLoading } = useAuth();
  const [feedPosts, setFeedPosts] = useState<PostWithAuthor[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    if (!appUser) return;

    setFeedLoading(true);
    const posts = await getPostsForFeed(appUser.id);
    setFeedPosts(posts);
    setFeedLoading(false);
  }, [appUser]);

  useEffect(() => {
    if (!authLoading && appUser) {
      loadFeed();
    } else if (!authLoading && !appUser) {
      setFeedLoading(false); // Not logged in, stop loading
    }
  }, [appUser, authLoading, loadFeed]);


  return (
      <main>
        <CreatePostForm onPostCreated={loadFeed} />
        {feedLoading ? <FeedSkeleton /> : (
          <div className="flex flex-col">
            {feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="text-muted-foreground text-center p-8">
                Your feed is empty. Follow some people to see their posts!
              </p>
            )}
          </div>
        )}
      </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <HomePageContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
