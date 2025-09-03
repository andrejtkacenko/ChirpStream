
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { getConversationsForUser, getUsersByIds, findOrCreateConversation } from "@/lib/data";
import type { Conversation, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { MailPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

function NewMessageDialog({ open, onOpenChange, onUserSelected }: { open: boolean, onOpenChange: (open: boolean) => void, onUserSelected: (userId: string) => void }) {
    const { appUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && appUser?.following) {
            setLoading(true);
            getUsersByIds(appUser.following)
                .then(setUsers)
                .finally(() => setLoading(false));
        }
    }, [open, appUser]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>Select someone you follow to start a conversation.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72">
                    <div className="p-4 flex flex-col gap-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                                    </div>
                                </div>
                                <Button onClick={() => onUserSelected(user.id)} size="sm">Message</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">You don't follow anyone yet.</p>
                    )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export function MessagesPageContent() {
    const { appUser, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const pathname = usePathname();

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

    const handleSelectUser = async (targetUserId: string) => {
        if (!appUser) return;
        
        setIsNewMessageDialogOpen(false);
        toast({ title: "Starting conversation..." });

        try {
            const conversationId = await findOrCreateConversation(appUser.id, targetUserId);
            router.push(`/messages/${conversationId}`);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            toast({ title: "Could not start conversation.", variant: "destructive" });
        }
    }


    if (loading || authLoading) {
        return (
            <main>
                <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <Skeleton className="h-10 w-10" />
                </div>
                <ConversationSkeleton />
            </main>
        )
    }
    
    const isActive = (convId: string) => pathname === `/messages/${convId}`;

    return (
        <>
        <main>
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10">
                <h1 className="text-2xl font-bold">Messages</h1>
                <Button variant="ghost" size="icon" onClick={() => setIsNewMessageDialogOpen(true)}>
                    <MailPlus className="h-6 w-6" />
                </Button>
            </div>
            <div className="flex flex-col">
                {conversations.length > 0 ? (
                    conversations.map(conv => {
                        const otherParticipant = conv.participantDetails.find(p => p.id !== appUser?.id);
                        if (!otherParticipant) return null;

                        return (
                            <Link key={conv.id} href={`/messages/${conv.id}`} className={cn("block hover:bg-muted/50 transition-colors", isActive(conv.id) && "bg-muted")}>
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
        <NewMessageDialog 
            open={isNewMessageDialogOpen}
            onOpenChange={setIsNewMessageDialogOpen}
            onUserSelected={handleSelectUser}
        />
        </>
    )
}

export default function MessagesRootPage() {
    return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold">Select a message</h2>
            <p className="text-muted-foreground">Choose from your existing conversations, or start a new one.</p>
        </div>
    )
}
