"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/lib/data";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export function WhoToFollow() {
  const { user: currentUser } = useAuth();
  const [usersToFollow, setUsersToFollow] = useState<User[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getUsers();
      // In a real app, you'd also get the current user's following list
      const filteredUsers = allUsers.filter(
        (user) => user.id !== currentUser?.uid
      ).slice(0, 3);
      setUsersToFollow(filteredUsers);
    };

    if(currentUser) {
      fetchUsers();
    }
  }, [currentUser]);


  const toggleFollow = (userId: string) => {
    setFollowed(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (!usersToFollow.length) {
    return <p className="text-sm text-muted-foreground">No users to suggest.</p>;
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
