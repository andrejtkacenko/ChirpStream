import { notFound } from "next/navigation";
import { getPostsByAuthor, getUserByUsername } from "@/lib/data";
import { UserProfileCard } from "@/components/chirpstream/user-profile-card";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/chirpstream/post-card";
import type { Post } from "@/lib/types";

type ProfilePageProps = {
  params: {
    username: string;
  };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const user = getUserByUsername(params.username);
  if (!user) {
    notFound();
  }

  const userPosts = getPostsByAuthor(user.id);

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
