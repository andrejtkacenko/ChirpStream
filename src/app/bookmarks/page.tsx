
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { getBookmarkedPosts } from "@/lib/data";
import type { PostWithAuthor } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/chirpstream/post-card";
import { Bookmark } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

function BookmarksSkeleton() {
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

function BookmarksPageContent() {
  const { appUser, loading: authLoading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!appUser) return;
    setLoading(true);
    const posts = await getBookmarkedPosts(appUser.id);
    setBookmarkedPosts(posts);
    setLoading(false);
  }, [appUser]);

  useEffect(() => {
    if (!authLoading) {
      loadBookmarks();
    }
  }, [authLoading, loadBookmarks]);

  return (
    <main>
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        {appUser && <p className="text-muted-foreground">@{appUser.username}</p>}
      </div>
      {loading ? <BookmarksSkeleton /> : (
        bookmarkedPosts.length > 0 ? (
          <div className="flex flex-col">
            {bookmarkedPosts.map((post) => (
              <PostCard key={post.id} post={post} author={post.author} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 flex flex-col items-center justify-center h-[60vh]">
            <Bookmark className="h-16 w-16 text-muted-foreground" />
             <h2 className="mt-6 text-2xl font-bold">No Bookmarks Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Save posts to find them easily later.
            </p>
          </div>
        )
      )}
    </main>
  );
}


export default function BookmarksPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <BookmarksPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
