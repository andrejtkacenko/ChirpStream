
"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Music, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function MainHeader() {
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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-full max-w-screen-xl h-16 flex items-center justify-between px-4">
                <div className="flex-1 max-w-md">
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
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                         <Link href="/notifications">
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/music">
                          <Button variant="ghost" size="icon">
                              <Music className="h-5 w-5" />
                          </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
