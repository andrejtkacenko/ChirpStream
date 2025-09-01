
"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Music, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useMemo } from "react";

const pageTitles: Record<string, string> = {
    '/': 'Home',
    '/explore': 'Explore',
    '/notifications': 'Notifications',
    '/messages': 'Messages',
    '/bookmarks': 'Bookmarks',
    '/music': 'Music',
    '/premium': 'Premium',
    '/studio': 'Creator Studio',
}

export function MainHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const title = useMemo(() => {
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }
        if (pathname.startsWith('/artist')) return 'Artist';
        if (pathname.match(/^\/[^/]+\/status\//)) return 'Post';
        if (pathname.match(/^\/[^/]+$/) && !pageTitles[pathname]) return 'Profile';
        
        return 'ChirpStream';
    }, [pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    }

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>
            </div>
        </header>
    )
}
