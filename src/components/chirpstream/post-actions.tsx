
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Share, Bookmark } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { toggleLike, toggleBookmark } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export function PostActions({ post }: { post: Post }) {
  const { appUser, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState(false);
  
  useEffect(() => {
    if (appUser) {
      setIsLiked(Array.isArray(post.likes) && post.likes.includes(appUser.id));
      setIsBookmarked(appUser.bookmarks?.includes(post.id) ?? false);
    }
    setLikes(post.likes?.length || 0);
  }, [post, appUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appUser || isProcessingLike) return;

    setIsProcessingLike(true);
    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikes(likes + (!originalIsLiked ? 1 : -1));

    try {
      await toggleLike(post.id, appUser.id);
    } catch (error) {
       toast({ title: "Failed to like post.", variant: "destructive" });
       setIsLiked(originalIsLiked);
       setLikes(likes);
    } finally {
        setIsProcessingLike(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appUser || isProcessingBookmark) return;

    setIsProcessingBookmark(true);
    const originalIsBookmarked = isBookmarked;
    setIsBookmarked(!originalIsBookmarked);

    try {
        await toggleBookmark(post.id, appUser.id);
        await refreshAppUser(); // Refresh user to get updated bookmarks
        toast({
            title: !originalIsBookmarked ? "Post bookmarked" : "Bookmark removed",
        });
    } catch (error) {
        toast({ title: "Failed to update bookmark.", variant: "destructive" });
        setIsBookmarked(originalIsBookmarked);
    } finally {
        setIsProcessingBookmark(false);
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
      isProcessing: isProcessingLike,
    },
    {
      Icon: Bookmark,
      label: "Bookmark",
      color: isBookmarked ? "text-primary" : "hover:text-primary",
      bgColor: "hover:bg-primary/10",
      onClick: handleBookmark,
      fillClass: isBookmarked ? "fill-current" : "",
      isProcessing: isProcessingBookmark,
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
      {actions.map(({ Icon, count, label, color, bgColor, onClick, fillClass, isProcessing }) => (
        <div key={label} className="flex items-center group">
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full", color, bgColor)}
            aria-label={label}
            onClick={onClick || ((e) => e.stopPropagation())}
            disabled={isProcessing}
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
