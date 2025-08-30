"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUsers, followUser, unfollowUser } from "@/lib/data";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";


export function WhoToFollow() {
  const { appUser: currentUser } = useAuth();
  const { toast } = useToast();
  const [usersToFollow, setUsersToFollow] = useState<User[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (currentUser) {
        const fetchUsers = async () => {
          const allUsers = await getUsers();
          const followedUsers = new Set(currentUser.following || []);
          const filteredUsers = allUsers.filter(
            (user) => user.id !== currentUser?.id && !followedUsers.has(user.id)
          ).slice(0, 3);
          setUsersToFollow(filteredUsers);
          setFollowed(followedUsers);
        };

        fetchUsers();
    }
  }, [currentUser]);


  const toggleFollow = async (userId: string) => {
    if (!currentUser) {
        toast({ title: "Please login to follow users.", variant: "destructive" });
        return;
    }
    
    const isCurrentlyFollowing = followed.has(userId);
    
    // Immediately update UI for responsiveness
    const newFollowed = new Set(followed);
    if (isCurrentlyFollowing) {
        newFollowed.delete(userId);
    } else {
        newFollowed.add(userId);
    }
    setFollowed(newFollowed);
    
    try {
        if (isCurrentlyFollowing) {
            await unfollowUser(currentUser.id, userId);
        } else {
            await followUser(currentUser.id, userId);
        }
    } catch (error) {
        console.error("Failed to toggle follow:", error);
        toast({ title: "Something went wrong.", variant: "destructive" });
        // Revert UI change on error
        const revertedFollowed = new Set(followed);
        if (isCurrentlyFollowing) {
            revertedFollowed.add(userId);
        } else {
            revertedFollowed.delete(userId);
        }
        setFollowed(revertedFollowed);
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
            variant={followed.has(user.id) ? "outline" : "default"}
            size="sm"
            onClick={() => toggleFollow(user.id)}
          >
            {followed.has(user.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  );
}
