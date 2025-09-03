
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { PostWithAuthor } from "@/lib/types";
import { getPosts } from "@/lib/data";
import { PostCard } from "@/components/chirpstream/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MainLayout } from "@/components/layout/main-layout";

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

const trendingTopics = [
    { category: "Politics · Trending", topic: "Space Exploration", posts: "21.7K posts" },
    { category: "Technology · Trending", topic: "#NextJSConf", posts: "128K posts" },
    { category: "Entertainment · Trending", topic: "New Movie Release", posts: "5,432 posts" },
    { category: "Sports · Trending", topic: "World Cup Finals", posts: "345K posts" },
    { category: "Gaming · Trending", topic: "Elden Ring DLC", posts: "98K posts" },
]

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

  const trendingPosts = useMemo(() => [...posts].sort(() => 0.5 - Math.random()).slice(0, 10), [posts]);
  const newsPosts = useMemo(() => [...posts].sort(() => 0.5 - Math.random()).slice(0, 10), [posts]);
  const sportsPosts = useMemo(() => [...posts].sort(() => 0.5 - Math.random()).slice(0, 10), [posts]);


  return (
    <main>
      <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Explore</h1>
            <Button variant="ghost" size="icon" className="ml-4">
                <Settings2 className="h-5 w-5" />
            </Button>
        </div>
      </div>
      
      <Carousel
          opts={{
              align: "start",
          }}
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
                  {trendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                  ))}
              </div>
            )}
         </TabsContent>
         <TabsContent value="news">
             {loading ? <FeedSkeleton /> : (
              <div className="flex flex-col">
                  {newsPosts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                  ))}
              </div>
            )}
        </TabsContent>
         <TabsContent value="sports">
            {loading ? <FeedSkeleton /> : (
              <div className="flex flex-col">
                  {sportsPosts.map((post) => (
                  <PostCard key={post.id} post={post} author={post.author} />
                  ))}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function ExplorePage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <ExplorePageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
