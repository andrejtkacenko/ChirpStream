
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";
import { MessagesPageContent } from "./page";
import { ReactNode } from "react";

function MessagesLayoutContent({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-full">
            <aside className="w-full md:w-2/5 border-r h-full overflow-y-auto">
                <MessagesPageContent />
            </aside>
            <main className="hidden md:block flex-1 h-full">
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
