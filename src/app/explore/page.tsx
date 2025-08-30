
"use client";

import { useEffect, useState, useCallback } from "react";
import type { PostWithAuthor } from "@/lib/types";
import { getPosts } from "@/lib/data";
import { PostCard } from "@/components/chirpstream/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/auth/protected-route";

function FeedSkeleton() {
  return (
    <div className="flex flex-col">
      {[1, 2, 3, 4, 5].map((n) => (
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


function ExplorePageContent() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExploreFeed = useCallback(async () => {
    setLoading(true);
    const allPosts = await getPosts();
    setPosts(allPosts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadExploreFeed();
  }, [loadExploreFeed]);

  return (
    <main>
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover what's happening across ChirpStream.</p>
      </div>
      {loading ? <FeedSkeleton /> : (
        <div className="flex flex-col">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} author={post.author} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function ExplorePage() {
    return (
        <ProtectedRoute>
            <ExplorePageContent />
        </ProtectedRoute>
    )
}
