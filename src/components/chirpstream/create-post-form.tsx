
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { createPost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_CHARS = {
  free: 280,
  premium: 1000,
  premium_plus: 4000
};

function CreatePostFormSkeleton() {
    return (
        <div className="flex gap-4 p-4 border-b">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="w-full space-y-2">
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>
        </div>
    )
}


export function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const { appUser, loading } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading || !appUser) {
    return <CreatePostFormSkeleton />;
  }

  const maxChars = MAX_CHARS[appUser.plan] || MAX_CHARS.free;
  const charsLeft = maxChars - content.length;

  const handleSubmit = async () => {
    if (!content.trim() || !appUser || content.length > maxChars) return;
    setIsSubmitting(true);
    try {
      await createPost(appUser.id, content);
      setContent("");
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      // Callback to refresh the feed
      onPostCreated();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 border-b">
      <Avatar>
        <AvatarImage src={appUser?.avatar ?? undefined} alt={appUser?.name ?? ""} />
        <AvatarFallback>{appUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder="What's happening?"
          className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:border-primary pb-2 px-0 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          maxLength={maxChars}
        />
        <div className="flex justify-end items-center mt-2 gap-4">
           <span className={cn("text-sm", charsLeft < 0 ? "text-destructive" : "text-muted-foreground")}>
            {charsLeft}
          </span>
          <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting || charsLeft < 0}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
