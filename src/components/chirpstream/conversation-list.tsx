
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

function ConversationListItem({ conversation }: { conversation: Conversation }) {
    const { appUser } = useAuth();
    const [timeAgo, setTimeAgo] = useState('');
    const pathname = usePathname();

    useEffect(() => {
        const getFormattedTimestamp = () => {
            const timestamp = conversation.lastMessage?.timestamp;
            if (!timestamp) return '';
            const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date((timestamp as any).seconds * 1000);
            return formatDistanceToNow(date, { addSuffix: true });
        }
        setTimeAgo(getFormattedTimestamp());
    }, [conversation.lastMessage?.timestamp]);

    const otherParticipant = conversation.participantDetails.find(p => p.id !== appUser?.id);
    if (!otherParticipant) return null;

    const isActive = (convId: string) => pathname === `/messages/${convId}`;

    return (
        <Link href={`/messages/${conversation.id}`} className={cn("block hover:bg-muted/50 transition-colors", isActive(conversation.id) && "bg-muted")}>
            <div className="flex items-start gap-4 p-4 border-b">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={otherParticipant.avatar} />
                    <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{otherParticipant.name}</span>
                        <span className="text-muted-foreground truncate">@{otherParticipant.username}</span>
                        {conversation.lastMessage && <span className="text-muted-foreground text-sm ml-auto shrink-0">{timeAgo}</span>}
                    </div>
                    {conversation.lastMessage && (
                        <p className="text-muted-foreground truncate text-sm">
                            {conversation.lastMessage.senderId === appUser?.id && 'You: '}
                            {conversation.lastMessage.text}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export function ConversationList() {
    const { appUser, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (appUser) {
            setLoading(true);
            getConversationsForUser(appUser.id)
                .then(setConversations)
                .finally(() => setLoading(false));
        }
    }, [appUser]);

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
                    conversations.map(conv => (
                       <ConversationListItem key={conv.id} conversation={conv} />
                    ))
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
