
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                         <Link href="/" className="flex items-center gap-2">
                            <Wind className="h-6 w-6 text-primary" />
                            <span className="font-bold hidden sm:inline-block">ChirpStream</span>
                        </Link>
                    </div>
                    <Button asChild>
                        <Link href="/">Back to App</Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
