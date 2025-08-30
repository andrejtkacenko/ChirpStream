
"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { getPostsByAuthor, getUserByUsername } from "@/lib/data";
import { UserProfileCard } from "@/components/chirpstream/user-profile-card";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/chirpstream/post-card";
import type { Post, User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";

function ProfilePageSkeleton() {
  return (
    <div className="p-4 md:p-6">
      <div className="h-48 bg-muted rounded-t-lg relative">
        <div className="absolute -bottom-16 left-6">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
        </div>
      </div>
      <div className="pt-20 px-6 pb-6 bg-card rounded-b-lg">
        <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
        </div>
        <div>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-4" />
        <div className="flex gap-4 mt-4 text-sm">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Separator className="my-6" />
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}


function ProfilePageContent() {
  const params = useParams();
  const { username } = params;
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
        if (typeof username !== 'string') return;
        setLoading(true);
        const profileUser = await getUserByUsername(username);
        if (!profileUser) {
            notFound();
        }

        setUser(profileUser);
        const posts = await getPostsByAuthor(profileUser.id);
        setUserPosts(posts);
        setLoading(false);
    }

    if (!authLoading && authUser) {
        loadProfileData();
    }
  }, [username, authUser, authLoading]);

  if (loading || authLoading || !user) {
    return <ProfilePageSkeleton />;
  }
  
  return (
    <div className="p-4 md:p-6">
      <UserProfileCard user={user} postCount={userPosts.length} />
      <Separator className="my-6" />
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      <div className="flex flex-col gap-6">
        {userPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} author={user} />
        ))}
        {userPosts.length === 0 && (
          <p className="text-muted-foreground text-center py-8">This user hasn't posted anything yet.</p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePageContent />
        </ProtectedRoute>
    )
}
