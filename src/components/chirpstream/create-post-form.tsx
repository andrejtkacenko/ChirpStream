"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { createPost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export function CreatePostForm() {
  const { appUser } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleSubmit = async () => {
    if (!content.trim() || !appUser) return;
    setIsSubmitting(true);
    try {
      await createPost(appUser.id, content);
      setContent("");
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      // A simple way to refresh the feed
      router.refresh();
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
        />
        <div className="flex justify-end mt-2">
          <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
