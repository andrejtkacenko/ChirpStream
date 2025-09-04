
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Share, Bookmark, FolderPlus } from "lucide-react";
import type { Post, PostWithAuthor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { toggleBookmark, movePostToBookmarkFolder, toggleLike, repostPost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function PostActions({ post }: { post: PostWithAuthor }) {
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

      const allBookmarkIds = [
        ...(appUser.bookmarks || []),
        ...(appUser.bookmarkFolders || []).flatMap(f => f.postIds)
      ];
      setIsBookmarked(allBookmarkIds.includes(post.id));

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

  const handleBookmarkToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleMoveToFolder = async (e: React.MouseEvent, folderId: string | 'root') => {
    e.stopPropagation();
    if (!appUser) return;
    
    // Find which folder the post is currently in
    let fromFolderId = 'root';
    if (appUser.bookmarks?.includes(post.id)) {
        fromFolderId = 'root';
    } else if (appUser.bookmarkFolders) {
        const foundFolder = appUser.bookmarkFolders.find(f => f.postIds.includes(post.id));
        if (foundFolder) fromFolderId = foundFolder.id;
    }

    // Add to bookmarks if it's not already
    if (!isBookmarked) {
      await handleBookmarkToggle();
    }
    
    try {
      await movePostToBookmarkFolder(appUser.id, post.id, fromFolderId, folderId);
      await refreshAppUser();
      toast({ title: "Post moved" });
    } catch (error) {
       console.error(error);
       toast({ title: "Failed to move post", variant: "destructive" });
    }
  }


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
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: "Link copied to clipboard!" });
        } catch (copyError) {
            console.error("Failed to copy to clipboard:", copyError);
            toast({ title: "Could not copy link.", variant: "destructive" });
        }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.author.username}`,
          text: post.content,
          url: shareUrl,
        });
      } catch (error: any) {
        // If sharing fails (e.g. permission denied, or aborted by user)
        // fall back to copying the link to the clipboard.
        if (error.name !== 'AbortError') {
             console.error("Error sharing:", error);
             await copyToClipboard();
        }
      }
    } else {
        await copyToClipboard();
    }
  };

  const isPremium = appUser?.plan === 'premium' || appUser?.plan === 'premium_plus';

  const bookmarkAction = {
      Icon: Bookmark,
      label: "Bookmark",
      color: isBookmarked ? "text-primary" : "hover:text-primary",
      bgColor: "hover:bg-primary/10",
      onClick: handleBookmarkToggle,
      fillClass: isBookmarked ? "fill-current" : "",
      isProcessing: isProcessingBookmark,
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
    // Bookmark and Share are handled separately
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
      <div className="flex items-center">
        {isPremium ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full", bookmarkAction.color, bookmarkAction.bgColor)}
                        aria-label={bookmarkAction.label}
                        disabled={bookmarkAction.isProcessing}
                        >
                        <bookmarkAction.Icon className={cn("h-5 w-5", bookmarkAction.fillClass)} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleBookmarkToggle()}>
                        {isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Add to folder</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuItem onClick={(e) => handleMoveToFolder(e, 'root')}>
                                Unsorted
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            {appUser?.bookmarkFolders?.map(folder => (
                            <DropdownMenuItem key={folder.id} onClick={(e) => handleMoveToFolder(e, folder.id)}>
                                {folder.name}
                            </DropdownMenuItem>
                            ))}
                             <DropdownMenuSeparator />
                             <DropdownMenuItem>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Create new folder...
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuContent>
             </DropdownMenu>
        ) : (
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", bookmarkAction.color, bookmarkAction.bgColor)}
                aria-label={bookmarkAction.label}
                onClick={bookmarkAction.onClick}
                disabled={bookmarkAction.isProcessing}
                >
                <bookmarkAction.Icon className={cn("h-5 w-5", bookmarkAction.fillClass)} />
            </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-primary/10" onClick={handleShare}>
            <Share className="h-5 w-5"/>
        </Button>
      </div>
    </div>
  );
}
