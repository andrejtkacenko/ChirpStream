"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { followUser, unfollowUser, updateUserPlan } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Crown } from "lucide-react";


type UserProfileCardProps = {
  user: User;
  postCount: number;
};

export function UserProfileCard({ user, postCount }: UserProfileCardProps) {
  const { appUser: currentUser, loading, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers.length);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isCurrentUser = user.id === currentUser?.id;

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(currentUser.following.includes(user.id));
    }
    setFollowersCount(user.followers.length);
  }, [currentUser, user]);
  
  const toggleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Please login to follow users.", variant: "destructive" });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, user.id);
        setFollowersCount(prev => prev - 1);
        setIsFollowing(false);
      } else {
        await followUser(currentUser.id, user.id);
        setFollowersCount(prev => prev + 1);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async () => {
    if (!isCurrentUser) return;
    setIsProcessing(true);
    const newPlan = user.plan === 'free' ? 'premium' : 'premium_plus';
    try {
        await updateUserPlan(user.id, newPlan);
        await refreshAppUser();
        toast({ title: "Congratulations!", description: `You are now a ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} user.` });
    } catch (error) {
        console.error("Failed to upgrade plan:", error);
        toast({ title: "Upgrade failed.", description: "Could not update your plan.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  }

  const renderUpgradeButton = () => {
    if (!isCurrentUser || user.plan === 'premium_plus') return null;

    return (
        <Button onClick={handleUpgrade} disabled={isProcessing}>
            <Crown className="mr-2 h-4 w-4" />
            {user.plan === 'free' ? 'Upgrade to Premium' : 'Upgrade to Premium+'}
        </Button>
    )
  }

  return (
    <div>
      <div className="h-48 bg-muted rounded-t-lg relative">
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-20 px-6 pb-6 bg-card rounded-b-lg">
        <div className="flex justify-end">
          {isCurrentUser ? renderUpgradeButton() : (
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              onClick={toggleFollow}
              disabled={loading || isProcessing}
            >
              {isProcessing ? "..." : isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            {user.plan !== 'free' && (
                <div className={`p-1 rounded-full ${user.plan === 'premium_plus' ? 'bg-gradient-to-tr from-purple-500 to-indigo-600' : 'bg-gradient-to-tr from-amber-400 to-yellow-200'}`}>
                    <Crown className="h-5 w-5 text-yellow-900" />
                </div>
            )}
          </div>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        <p className="mt-4 text-base">{user.bio}</p>
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{postCount}</span> Posts
          </span>
          <span>
            <span className="font-bold text-foreground">{user.following.length}</span> Following
          </span>
          <span>
            <span className="font-bold text-foreground">{followersCount}</span> Followers
          </span>
        </div>
      </div>
    </div>
  );
}
