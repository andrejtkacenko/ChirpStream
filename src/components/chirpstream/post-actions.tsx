"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Share } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PostActions({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
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
      color: isLiked ? "text-red-500" : "hover:text-red-500",
      bgColor: "hover:bg-red-500/10",
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
          >
            <Icon className={cn("h-5 w-5", fillClass)} />
          </Button>
          {count !== undefined && (
            <span
              className={cn(
                "text-sm text-muted-foreground group-hover:text-[var(--hover-color)]",
                color,
                isLiked && label === "Like" ? "text-red-500" : ""
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
