import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { PostCard } from "@/components/chirpstream/post-card";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Separator } from "@/components/ui/separator";
import { currentUser, getPosts, getUserById } from "@/lib/data";
import type { Post } from "@/lib/types";

export default function Home() {
  const followedUserIds = currentUser.following;
  const feedPosts = getPosts().filter(post => followedUserIds.includes(post.authorId) || post.authorId === currentUser.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 p-4 md:p-6">
      <main>
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <CreatePostForm />
        <Separator className="my-6" />
        <div className="flex flex-col gap-6">
          {feedPosts.map((post: Post) => {
            const author = getUserById(post.authorId);
            if (!author) return null;
            return <PostCard key={post.id} post={post} author={author} />;
          })}
        </div>
      </main>
      <aside className="hidden xl:block">
        <RightSidebar />
      </aside>
    </div>
  );
}
