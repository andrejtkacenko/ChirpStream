"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/data";
import type { User } from "@/lib/types";

type UserProfileCardProps = {
  user: User;
  postCount: number;
};

export function UserProfileCard({ user, postCount }: UserProfileCardProps) {
  const isCurrentUser = user.id === currentUser.id;
  const initialIsFollowing = currentUser.following.includes(user.id);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

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
          {!isCurrentUser && (
            <Button variant={isFollowing ? "outline" : "default"} onClick={toggleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
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
            <span className="font-bold text-foreground">{user.followers.length + (isFollowing && !initialIsFollowing ? 1 : 0) - (!isFollowing && initialIsFollowing ? 1 : 0)}</span> Followers
          </span>
        </div>
      </div>
    </div>
  );
}
