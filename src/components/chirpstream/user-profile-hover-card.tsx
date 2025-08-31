
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "@/lib/data";
import Link from "next/link";
import { Crown } from "lucide-react";


export function UserProfileHoverCard({ children, user }: { children: React.ReactNode, user: User }) {
  const { appUser: currentUser, loading, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentUser = user.id === currentUser?.id;

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(user.id));
    }
  }, [currentUser, user.id]);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      toast({ title: "Please login to follow users.", variant: "destructive" });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, user.id);
        setIsFollowing(false);
      } else {
        await followUser(currentUser.id, user.id);
        setIsFollowing(true);
      }
      await refreshAppUser();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButtons = () => {
    if (isCurrentUser) {
        return null;
    } else {
        return (
            <Button 
                variant={isFollowing ? "outline" : "default"} 
                onClick={toggleFollow}
                disabled={loading || isProcessing}
                size="sm"
            >
                {isProcessing ? "..." : isFollowing ? "Following" : "Follow"}
            </Button>
        )
    }
  }


  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                 <Link href={`/${user.username}`}>
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                 </Link>
                {renderActionButtons()}
            </div>
            <div>
                <Link href={`/${user.username}`} className="hover:underline">
                    <div className="flex items-center gap-1">
                        <h3 className="text-lg font-bold">{user.name}</h3>
                         {(user.plan === 'premium' || user.plan === 'premium_plus') && (
                            <Crown className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <p className="text-muted-foreground">@{user.username}</p>
                </Link>
                <p className="mt-2 text-sm">{user.bio}</p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
                <span>
                    <span className="font-bold text-foreground">{user.following.length}</span> Following
                </span>
                <span>
                    <span className="font-bold text-foreground">{user.followers.length}</span> Followers
                </span>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
