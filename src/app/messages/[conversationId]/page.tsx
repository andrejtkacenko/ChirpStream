
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { getConversation, getMessagesForConversation, sendMessage } from "@/lib/data";
import type { Conversation, Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';


function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 p-2 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="flex-grow p-4 space-y-4">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-48 rounded-lg" />
                </div>
                 <div className="flex justify-start gap-2">
                    <Skeleton className="h-10 w-48 rounded-lg" />
                </div>
                 <div className="flex justify-end gap-2">
                    <Skeleton className="h-16 w-64 rounded-lg" />
                </div>
                 <div className="flex justify-start gap-2">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
            </div>
            <div className="p-2 border-t">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

function ConversationPageContent() {
    const params = useParams();
    const router = useRouter();
    const { conversationId } = params;
    const { appUser, loading: authLoading } = useAuth();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        async function fetchConversation() {
            if (typeof conversationId !== 'string') return;
            setLoading(true);
            const conv = await getConversation(conversationId);
            setConversation(conv);
            setLoading(false);
        }
        fetchConversation();

        const unsubscribe = getMessagesForConversation(conversationId as string, setMessages);
        return () => unsubscribe();

    }, [conversationId]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !appUser || !conversationId) return;
        setIsSending(true);
        try {
            await sendMessage(conversationId as string, appUser.id, newMessage.trim());
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    }

    if (loading || authLoading) {
        return <ChatSkeleton />;
    }

    if (!conversation) {
        return <div className="text-center p-8">Conversation not found.</div>;
    }

    const otherParticipant = conversation.participantDetails.find(p => p.id !== appUser?.id);

    return (
        <div className="flex flex-col h-full max-h-screen overflow-hidden">
            <header className="flex items-center gap-4 p-2 border-b shrink-0">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/messages')}>
                    <ArrowLeft />
                </Button>
                {otherParticipant && (
                    <Link href={`/${otherParticipant.username}`} className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
                            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{otherParticipant.name}</p>
                            <p className="text-sm text-muted-foreground">@{otherParticipant.username}</p>
                        </div>
                    </Link>
                )}
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => {
                        const isSender = message.senderId === appUser?.id;
                        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                        const messageDate = message.createdAt instanceof Timestamp ? message.createdAt.toDate() : new Date((message.createdAt as any).seconds * 1000);

                        return (
                            <div key={message.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                {!isSender && (
                                    <div className="w-8 shrink-0">
                                      {showAvatar && message.sender &&
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={message.sender.avatar} />
                                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                       }
                                    </div>
                                )}
                                <div className="group relative max-w-xs md:max-w-md">
                                    <div className={cn("px-4 py-2 rounded-lg break-words", 
                                        isSender 
                                        ? "bg-primary text-primary-foreground rounded-br-none" 
                                        : "bg-muted rounded-bl-none"
                                    )}>
                                       {message.text}
                                    </div>
                                    <div className="text-xs text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {format(messageDate, 'p')}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t bg-background shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Start a new message" 
                        autoComplete="off"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </footer>
        </div>
    )
}

export default function ConversationPage() {
    return (
        <ProtectedRoute>
            <ConversationPageContent />
        </ProtectedRoute>
    )
}
