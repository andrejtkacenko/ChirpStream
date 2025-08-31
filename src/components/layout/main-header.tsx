
"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { SearchBar } from "../chirpstream/search-bar";
import { Bell, Music, Wind } from "lucide-react";

export function MainHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-full max-w-screen-xl h-16 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" aria-label="Home" className='shrink-0'>
                            <Wind className="w-6 h-6 text-primary" />
                        </Button>
                    </Link>
                    <div className="w-64">
                         <SearchBar />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Music className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
