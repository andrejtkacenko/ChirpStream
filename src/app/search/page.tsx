import { PostCard } from "@/components/chirpstream/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPosts, getUserById, getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

function UserResultCard({ user }: { user: User }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <Link href={`/${user.username}`} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold hover:underline">{user.name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
        <Button variant="outline">Follow</Button>
      </CardContent>
    </Card>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const allPosts = await getPosts();
  const allUsers = await getUsers();

  const filteredPosts = query ? allPosts.filter(post =>
    post.content.toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredUsers = query ? allUsers.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase())
  ) : [];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold">Search results for "{query}"</h1>
      <Tabs defaultValue="posts" className="mt-4">
        <TabsList>
          <TabsTrigger value="posts">Posts ({filteredPosts.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="flex flex-col gap-6 mt-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(async post => {
                const author = await getUserById(post.authorId);
                if (!author) return null;
                return <PostCard key={post.id} post={post} author={author} />;
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">No posts found.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="flex flex-col gap-4 mt-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => <UserResultCard key={user.id} user={user} />)
            ) : (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
