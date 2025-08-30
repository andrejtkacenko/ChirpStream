
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Share } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { toggleLike } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export function PostActions({ post }: { post: Post }) {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (appUser && post.likes) {
      setIsLiked(post.likes.includes(appUser.id));
    }
    if (post.likes) {
      setLikes(post.likes.length);
    }
  }, [post, appUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appUser || isProcessing) return;

    setIsProcessing(true);
    try {
      await toggleLike(post.id, appUser.id);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      } else {
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (error) {
       toast({ title: "Failed to like post.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  const actions = [
    {
      Icon: MessageCircle,
      count: post.replies,
      label: "Reply",
      color: "hover:text-primary",
      bgColor: "hover:bg-primary/10",
    },
    {
      Icon: Repeat,
      count: post.reposts,
      label: "Repost",
      color: "hover:text-green-500",
      bgColor: "hover:bg-green-500/10",
    },
    {
      Icon: Heart,
      count: likes,
      label: "Like",
      color: isLiked ? "text-destructive" : "hover:text-destructive",
      bgColor: "hover:bg-destructive/10",
      onClick: handleLike,
      fillClass: isLiked ? "fill-current" : "",
    },
    {
      Icon: Share,
      label: "Share",
      color: "hover:text-primary",
      bgColor: "hover:bg-primary/10",
    },
  ];

  return (
    <div className="flex items-center justify-between mt-4 -ml-2">
      {actions.map(({ Icon, count, label, color, bgColor, onClick, fillClass }) => (
        <div key={label} className="flex items-center group">
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full", color, bgColor)}
            aria-label={label}
            onClick={onClick || ((e) => e.stopPropagation())}
            disabled={isProcessing && label === 'Like'}
          >
            <Icon className={cn("h-5 w-5", fillClass)} />
          </Button>
          {count !== undefined && (
            <span
              className={cn(
                "text-sm text-muted-foreground",
                label === "Like" && isLiked ? "text-destructive" : "group-hover:" + color.replace('hover:','')
              )}
            >
              {count > 0 ? count : ""}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
