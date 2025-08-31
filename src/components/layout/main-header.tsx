
"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Music, Wind } from "lucide-react";

export function MainHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-full max-w-screen-xl h-16 flex items-center justify-between px-4">
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>
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
