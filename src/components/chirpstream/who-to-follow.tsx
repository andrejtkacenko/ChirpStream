"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser, getUsers } from "@/lib/data";
import Link from "next/link";
import { useState } from "react";

export function WhoToFollow() {
  const allUsers = getUsers();
  const usersToFollow = allUsers.filter(
    (user) => user.id !== currentUser.id && !currentUser.following.includes(user.id)
  ).slice(0, 3);
  
  const [followed, setFollowed] = useState<string[]>([]);

  const toggleFollow = (userId: string) => {
    setFollowed(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

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
            variant={followed.includes(user.id) ? "outline" : "default"}
            size="sm"
            onClick={() => toggleFollow(user.id)}
          >
            {followed.includes(user.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  );
}
