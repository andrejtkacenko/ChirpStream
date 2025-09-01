
"use client";

import { usePathname } from 'next/navigation'
import { WhoToFollow } from "../chirpstream/who-to-follow";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const newsItems = [
    { topic: "Space", title: "NASA discovers new planet in nearby galaxy", posts: "12.3k posts" },
    { topic: "Technology", title: "The new iPhone just dropped and it's controversial", posts: "45.1k posts" },
    { topic: "Politics", title: "New bill passes with bipartisan support", posts: "89.2k posts" },
]

export function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
  }

  return (
    <div className="sticky top-6 flex flex-col gap-6">
      <form onSubmit={handleSearch}>
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search ChirpStream" 
                  className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary focus-visible:ring-2 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      </form>

      <Card className="bg-secondary/50 border-none">
        <CardHeader>
          <CardTitle>What's happening</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            {newsItems.map((item, index) => (
                <div key={index}>
                    <p className="text-sm text-muted-foreground">{item.topic}</p>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.posts}</p>
                </div>
            ))}
        </CardContent>
      </Card>
      <Card className="bg-secondary/50 border-none">
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <WhoToFollow />
        </CardContent>
      </Card>
    </div>
  );
}
