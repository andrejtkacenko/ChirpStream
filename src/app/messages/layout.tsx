
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";
import { MessagesPageContent } from "./page";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function MessagesLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isConversationOpen = pathname.includes('/messages/') && pathname !== '/messages';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <aside className={cn(
                "border-r h-full overflow-y-auto",
                isConversationOpen && "hidden md:block"
            )}>
                <MessagesPageContent />
            </aside>
            <main className={cn(
                "h-full md:col-span-2",
                 !isConversationOpen && "hidden md:block"
            )}>
                {children}
            </main>
        </div>
    )
}


export default function MessagesLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <MainLayout>
                <div className="h-[calc(100vh-theme(height.14))]">
                     <MessagesLayoutContent>{children}</MessagesLayoutContent>
                </div>
            </MainLayout>
        </ProtectedRoute>
    )
}
