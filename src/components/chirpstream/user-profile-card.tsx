
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { followUser, unfollowUser, updateUserPlan, findOrCreateConversation } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Crown, Mail, Pencil, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { SettingsDialog } from "../settings/settings-dialog";


type UserProfileCardProps = {
  user: User;
  postCount: number;
};

export function UserProfileCard({ user, postCount }: UserProfileCardProps) {
  const { appUser: currentUser, loading, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
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
      await refreshAppUser();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
        toast({ title: "Please login to send messages.", variant: "destructive" });
        return;
    }
    setIsProcessing(true);
    try {
        const conversationId = await findOrCreateConversation(currentUser.id, user.id);
        router.push(`/messages/${conversationId}`);
    } catch (error) {
        console.error("Failed to start conversation:", error);
        toast({ title: "Could not start conversation.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  }


  const renderActionButtons = () => {
    if (isCurrentUser) {
        return (
            <SettingsDialog>
                <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </SettingsDialog>
        )
    } else {
        return (
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleSendMessage} disabled={isProcessing}>
                    <Mail className="h-4 w-4" />
                </Button>
                <Button 
                  variant={isFollowing ? "outline" : "default"} 
                  onClick={toggleFollow}
                  disabled={loading || isProcessing}
                  className="w-28"
                >
                  {isProcessing ? "..." : isFollowing ? "Following" : "Follow"}
                </Button>
            </div>
        )
    }
  }

  return (
    <div>
      <div className="h-36 md:h-48 bg-muted rounded-t-lg relative">
        <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-14 md:pt-20 px-4 md:px-6 pb-6 bg-card rounded-b-lg">
        <div className="flex justify-end mb-4">
          {renderActionButtons()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            {user.plan !== 'free' && (
              <Crown className="h-5 w-5 text-primary" />
            )}
          </div>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        <p className="mt-4 text-base">{user.bio}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
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
