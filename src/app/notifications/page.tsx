
"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import { Bell, Heart, UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { getNotifications, markNotificationsAsRead } from "@/lib/data";
import type { Notification } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/main-layout";

function NotificationSkeleton() {
    return (
        <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex items-start gap-4 p-4 border-b">
                    <Skeleton className="h-8 w-8" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function NotificationItem({ notification }: { notification: Notification }) {
    const getNotificationDate = () => {
        if (!notification.createdAt) return new Date();
        return notification.createdAt instanceof Timestamp 
            ? notification.createdAt.toDate() 
            : new Date(notification.createdAt as any);
    };

    const timeAgo = formatDistanceToNow(getNotificationDate(), { addSuffix: true });

    if (!notification.actor) return null;

    const notificationLink = notification.type === 'follow' 
        ? `/${notification.actor.username}`
        : `/${notification.post?.author.username}/status/${notification.postId}`;

    return (
        <Link href={notificationLink} className={cn("block border-b transition-colors", !notification.read && "bg-primary/5")}>
             <div className="flex items-start gap-4 p-4">
                <div className="w-8 mt-1">
                    {notification.type === 'like' && <Heart className="h-6 w-6 text-destructive" />}
                    {notification.type === 'follow' && <UserPlus className="h-6 w-6 text-primary" />}
                </div>
                 <div className="w-full">
                     <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.actor.avatar} />
                            <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold">{notification.actor.name}</p>
                     </div>
                     <p className="text-muted-foreground">
                        {notification.type === 'like' && `liked your post: "${notification.post?.content}"`}
                        {notification.type === 'follow' && `started following you.`}
                     </p>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                 </div>
            </div>
        </Link>
    )
}


function NotificationsPageContent() {
    const { appUser, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!appUser) return;
        setLoading(true);
        const fetchedNotifications = await getNotifications(appUser.id);
        setNotifications(fetchedNotifications);
        setLoading(false);
        // Mark as read after fetching and displaying
        await markNotificationsAsRead(appUser.id);
    }, [appUser]);

    useEffect(() => {
        if (!authLoading && appUser) {
            loadNotifications();
        }
    }, [authLoading, appUser, loadNotifications]);

    return (
        <main>
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            {loading ? <NotificationSkeleton /> : (
                notifications.length > 0 ? (
                    <div className="flex flex-col">
                        {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                        <Bell className="h-16 w-16 text-muted-foreground" />
                        <h2 className="mt-6 text-2xl font-bold">No new notifications</h2>
                        <p className="mt-2 text-muted-foreground">
                            When you get notifications about new followers or post likes, they will show up here.
                        </p>
                    </div>
                )
            )}
        </main>
    )
}

export default function NotificationsPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <NotificationsPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
