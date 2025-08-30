import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Separator } from "@/components/ui/separator";
import { getPosts, getUserById, getUserByUsername } from "@/lib/data";
import type { Post } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { auth } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/context/auth-context";

// Note: This is a placeholder for the current user.
// In a real app, you would get this from your auth provider.
const getCurrentUser = async () => {
  // This is a mock, replace with your actual user fetching logic
  return await getUserByUsername("alice");
};


export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return <ProtectedRoute><p>Please log in.</p></ProtectedRoute>;
  }

  const followedUserIds = currentUser.following;
  const allPosts = await getPosts();
  
  const feedPosts = allPosts.filter(post => followedUserIds.includes(post.authorId) || post.authorId === currentUser.id);

  return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 p-4 md:p-6">
        <main>
          <h1 className="text-2xl font-bold mb-4">Home</h1>
          <CreatePostForm />
          <Separator className="my-6" />
          <div className="flex flex-col gap-6">
            {feedPosts.map(async (post: Post) => {
              const author = await getUserById(post.authorId);
              if (!author) return null;
              return <PostCard key={post.id} post={post} author={author} />;
            })}
          </div>
        </main>
        <aside className="hidden xl:block">
          <RightSidebar />
        </aside>
      </div>
    </ProtectedRoute>
  );
}
