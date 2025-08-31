
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUsers, followUser, unfollowUser } from "@/lib/data";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";


export function WhoToFollow() {
  const { appUser: currentUser, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const [usersToFollow, setUsersToFollow] = useState<User[]>([]);
  
  const followedUserIds = useMemo(() => new Set(currentUser?.following || []), [currentUser?.following]);

  useEffect(() => {
    if (currentUser) {
        const fetchUsers = async () => {
          const allUsers = await getUsers();
          const filteredUsers = allUsers.filter(
            (user) => user.id !== currentUser?.id && !followedUserIds.has(user.id)
          ).slice(0, 3);
          setUsersToFollow(filteredUsers);
        };

        fetchUsers();
    }
  }, [currentUser, followedUserIds]);


  const toggleFollow = async (userId: string) => {
    if (!currentUser) {
        toast({ title: "Please login to follow users.", variant: "destructive" });
        return;
    }
    
    const isCurrentlyFollowing = followedUserIds.has(userId);
    
    // Optimistically update the UI
    if (isCurrentlyFollowing) {
      setUsersToFollow(prev => [...prev, usersToFollow.find(u => u.id === userId)!]);
    } else {
      setUsersToFollow(prev => prev.filter(u => u.id !== userId));
    }

    try {
        if (isCurrentlyFollowing) {
            await unfollowUser(currentUser.id, userId);
        } else {
            await followUser(currentUser.id, userId);
        }
        await refreshAppUser();
    } catch (error) {
        console.error("Failed to toggle follow:", error);
        toast({ title: "Something went wrong.", variant: "destructive" });
        // Revert UI change on error
        if (isCurrentlyFollowing) {
           setUsersToFollow(prev => prev.filter(u => u.id !== userId));
        } else {
           setUsersToFollow(prev => [...prev, usersToFollow.find(u => u.id === userId)!]);
        }
    }
  };

  if (!usersToFollow.length) {
    return <p className="text-sm text-muted-foreground">No new users to suggest.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <Link href={`/${user.username}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold hover:underline">{user.name}</span>
              <span className="text-sm text-muted-foreground">@{user.username}</span>
            </div>
          </Link>
          <Button 
            variant={followedUserIds.has(user.id) ? "outline" : "default"}
            size="sm"
            onClick={() => toggleFollow(user.id)}
          >
            {followedUserIds.has(user.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  );
}
