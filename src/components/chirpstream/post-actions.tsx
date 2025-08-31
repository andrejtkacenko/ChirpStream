
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Share, Bookmark } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { toggleLike, toggleBookmark, repostPost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export function PostActions({ post }: { post: Post }) {
  const { appUser, refreshAppUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [reposts, setReposts] = useState(post.reposts || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState(false);
  const [isProcessingRepost, setIsProcessingRepost] = useState(false);
  
  useEffect(() => {
    if (appUser) {
      setIsLiked(Array.isArray(post.likes) && post.likes.includes(appUser.id));
      setIsBookmarked(appUser.bookmarks?.includes(post.id) ?? false);
      setIsReposted(Array.isArray(post.repostedBy) && post.repostedBy.includes(appUser.id));
    }
    setLikes(post.likes?.length || 0);
    setReposts(post.reposts || 0);
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

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${post.author.username}/status/${post.id}`);
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!appUser || isProcessingRepost) return;

    setIsProcessingRepost(true);
    const originalIsReposted = isReposted;
    setIsReposted(!originalIsReposted);
    setReposts(reposts + (!originalIsReposted ? 1 : -1));

    try {
        await repostPost(post.id, appUser.id, !originalIsReposted);
    } catch (error) {
        toast({ title: "Failed to repost.", variant: "destructive" });
        setIsReposted(originalIsReposted);
        setReposts(reposts);
    } finally {
        setIsProcessingRepost(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/${post.author.username}/status/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.author.username}`,
          text: post.content,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({ title: "Could not share post.", variant: "destructive" });
      }
    } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied to clipboard!" });
    }
  };


  const actions = [
    {
      Icon: MessageCircle,
      count: post.replies,
      label: "Reply",
      color: "hover:text-primary",
      bgColor: "hover:bg-primary/10",
      onClick: handleReply,
    },
    {
      Icon: Repeat,
      count: reposts,
      label: "Repost",
      color: isReposted ? "text-green-500" : "hover:text-green-500",
      bgColor: "hover:bg-green-500/10",
      onClick: handleRepost,
      isProcessing: isProcessingRepost,
      fillClass: isReposted ? "fill-current" : "",
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
      onClick: handleShare,
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
                (label === "Like" && isLiked && "text-destructive") ||
                (label === "Repost" && isReposted && "text-green-500") ||
                ("group-hover:" + color.replace('hover:',''))
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
