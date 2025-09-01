
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { getConversationsForUser } from "@/lib/data";
import type { Conversation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { MainLayout } from "@/components/layout/main-layout";

function ConversationSkeleton() {
    return (
        <div className="flex flex-col">
            {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MessagesPageContent() {
    const { appUser, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (appUser) {
            setLoading(true);
            getConversationsForUser(appUser.id)
                .then(setConversations)
                .finally(() => setLoading(false));
        }
    }, [appUser]);
    
    const getFormattedTimestamp = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return formatDistanceToNow(date, { addSuffix: true });
    }

    if (loading || authLoading) {
        return (
            <main>
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">Messages</h1>
                </div>
                <ConversationSkeleton />
            </main>
        )
    }

    return (
        <main>
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex flex-col">
                {conversations.length > 0 ? (
                    conversations.map(conv => {
                        const otherParticipant = conv.participantDetails.find(p => p.id !== appUser?.id);
                        if (!otherParticipant) return null;

                        return (
                            <Link key={conv.id} href={`/messages/${conv.id}`} className="block hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-4 p-4 border-b">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={otherParticipant.avatar} />
                                        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold truncate">{otherParticipant.name}</span>
                                            <span className="text-muted-foreground truncate">@{otherParticipant.username}</span>
                                            {conv.lastMessage && <span className="text-muted-foreground text-sm ml-auto shrink-0">{getFormattedTimestamp(conv.lastMessage.timestamp)}</span>}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-muted-foreground truncate text-sm">
                                                {conv.lastMessage.senderId === appUser?.id && 'You: '}
                                                {conv.lastMessage.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                ) : (
                    <p className="text-center text-muted-foreground p-8">You have no messages yet.</p>
                )}
            </div>
        </main>
    )
}

export default function MessagesPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <MessagesPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
