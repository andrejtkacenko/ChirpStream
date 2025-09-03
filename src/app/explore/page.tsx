
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import type { PostWithAuthor, User } from "@/lib/types";
import { getPosts, searchPosts, searchUsers, followUser, unfollowUser } from "@/lib/data";
import { PostCard } from "@/components/chirpstream/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings2, Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MainLayout } from "@/components/layout/main-layout";
import { useSearchParams, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";


function FeedSkeleton() {
  return (
    <div className="flex flex-col mt-4">
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

function UserResultCard({ user }: { user: User }) {
  const { appUser: currentUser, loading, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentUser = user.id === currentUser?.id;

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(user.id));
    }
  }, [currentUser, user.id]);

  const toggleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Please login to follow users.", variant: "destructive" });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, user.id);
        setIsFollowing(false);
      } else {
        await followUser(currentUser.id, user.id);
        setIsFollowing(true);
      }
      await refreshAppUser();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

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
        {!isCurrentUser && (
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              onClick={toggleFollow}
              disabled={loading || isProcessing}
            >
              {isProcessing ? "..." : isFollowing ? "Following" : "Follow"}
            </Button>
          )}
      </CardContent>
    </Card>
  );
}

const trendingTopics = [
    { category: "Politics · Trending", topic: "Space Exploration", posts: "21.7K posts" },
    { category: "Technology · Trending", topic: "#NextJSConf", posts: "128K posts" },
    { category: "Entertainment · Trending", topic: "New Movie Release", posts: "5,432 posts" },
    { category: "Sports · Trending", topic: "World Cup Finals", posts: "345K posts" },
    { category: "Gaming · Trending", topic: "Elden Ring DLC", posts: "98K posts" },
]

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: authUser, loading: authLoading } = useAuth();
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const fetchExploreData = useCallback(async () => {
    setLoading(true);
    const allPosts = await getPosts();
    setPosts(allPosts);
    setLoading(false);
  }, []);

  const fetchSearchResults = useCallback(async () => {
    if (!query) return;
    if (!authUser) return;
    
    setLoading(true);
    
    const [foundPosts, foundUsers] = await Promise.all([
      searchPosts(query),
      searchUsers(query)
    ]);

    setPosts(foundPosts);
    setUsers(foundUsers);
    setLoading(false);
  }, [query, authUser]);

  useEffect(() => {
    setSearchQuery(query); // Sync input with URL param
    if (!authLoading) {
      if (query) {
        fetchSearchResults();
      } else {
        fetchExploreData();
      }
    }
  }, [query, authLoading, fetchExploreData, fetchSearchResults]);

  if (authLoading) {
    return <FeedSkeleton />;
  }

  return (
    <main>
      <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search ChirpStream" 
                  className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary focus-visible:ring-2 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </form>
      </div>
      
      {query ? (
        // Search Results View
        <div className="p-4 md:p-6">
          <p className="text-muted-foreground mb-4">Showing results for "{query}"</p>
          <Tabs defaultValue="posts" className="mt-4">
            <TabsList>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              {loading ? <FeedSkeleton /> : (
                <div className="flex flex-col">
                    {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} author={post.author} />
                    ))
                    ) : (
                    <p className="text-muted-foreground text-center py-8">No posts found matching your search.</p>
                    )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="users">
              {loading ? <FeedSkeleton /> : (
                <div className="flex flex-col gap-4 mt-4">
                    {users.length > 0 ? (
                    users.map(user => <UserResultCard key={user.id} user={user} />)
                    ) : (
                    <p className="text-muted-foreground text-center py-8">No users found matching your search.</p>
                    )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Default Explore View
        <>
            <Carousel
                opts={{ align: "start" }}
                className="w-full px-4 py-4"
            >
                <CarouselContent>
                    {trendingTopics.map((trend, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <Card className="rounded-2xl">
                            <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{trend.category}</p>
                                <p className="font-bold">{trend.topic}</p>
                                <p className="text-xs text-muted-foreground">{trend.posts}</p>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>

            <Tabs defaultValue="foryou" className="w-full">
              <TabsList className="w-full justify-around rounded-none border-b bg-transparent p-0 h-14">
                  <TabsTrigger value="foryou" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">For You</TabsTrigger>
                  <TabsTrigger value="trending" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Trending</TabsTrigger>
                  <TabsTrigger value="news" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">News</TabsTrigger>
                  <TabsTrigger value="sports" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Sports</TabsTrigger>
              </TabsList>
              <TabsContent value="foryou">
                  {loading ? <FeedSkeleton /> : (
                  <div className="flex flex-col">
                      {posts.map((post) => (
                      <PostCard key={post.id} post={post} author={post.author} />
                      ))}
                  </div>
                  )}
              </TabsContent>
              <TabsContent value="trending">
                  {loading ? <FeedSkeleton /> : (
                    <div className="flex flex-col">
                        {posts.slice().sort(() => 0.5 - Math.random()).map((post) => (
                        <PostCard key={post.id} post={post} author={post.author} />
                        ))}
                    </div>
                  )}
              </TabsContent>
              <TabsContent value="news">
                  {loading ? <FeedSkeleton /> : (
                    <div className="flex flex-col">
                        {posts.slice().sort(() => 0.5 - Math.random()).map((post) => (
                        <PostCard key={post.id} post={post} author={post.author} />
                        ))}
                    </div>
                  )}
              </TabsContent>
              <TabsContent value="sports">
                  {loading ? <FeedSkeleton /> : (
                    <div className="flex flex-col">
                        {posts.slice().sort(() => 0.5 - Math.random()).map((post) => (
                        <PostCard key={post.id} post={post} author={post.author} />
                        ))}
                    </div>
                  )}
              </TabsContent>
            </Tabs>
        </>
      )}
    </main>
  );
}

function ExplorePageWrapper() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ExplorePageContent />
      </MainLayout>
    </ProtectedRoute>
  )
}

export default function ExplorePage() {
    return (
      <Suspense fallback={<FeedSkeleton />}>
        <ExplorePageWrapper />
      </Suspense>
    )
}
