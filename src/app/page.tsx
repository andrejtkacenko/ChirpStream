
"use client";

import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { getPostsForFeed } from "@/lib/data";
import type { PostWithAuthor } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px]">
        <main className="border-x max-w-[600px] w-full">
          <div className="p-4 border-b flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
             <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-bold">Home</h1>
          </div>
          <CreatePostForm onPostCreated={loadFeed} />
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
        <aside className="hidden xl:block pt-6 pl-6">
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
