
"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { createPost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (loading || !appUser) {
    return <CreatePostFormSkeleton />;
  }

  const maxChars = MAX_CHARS[appUser.plan] || MAX_CHARS.free;
  const charsLeft = maxChars - content.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        }
        reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async () => {
    if ((!content.trim() && !imagePreview) || !appUser || content.length > maxChars) return;
    setIsSubmitting(true);
    try {
      await createPost(appUser.id, content, imagePreview ?? undefined);
      setContent("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
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
      <Avatar className="h-12 w-12">
        <AvatarImage src={appUser?.avatar ?? undefined} alt={appUser?.name ?? ""} />
        <AvatarFallback>{appUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder="What's happening?"
          className="bg-transparent border-0 border-b-0 focus-visible:ring-0 focus:border-primary pb-2 px-0 resize-none text-xl"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          maxLength={maxChars}
        />
        {imagePreview && (
          <div className="mt-4 relative">
             <Image src={imagePreview} alt="Image preview" width={500} height={300} className="rounded-lg object-cover w-full max-h-80" />
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/75 rounded-full"
                onClick={() => {
                    setImagePreview(null);
                     if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }}
            >
                <X className="h-5 w-5 text-white" />
             </Button>
          </div>
        )}
        <div className="flex justify-between items-center mt-2 border-t pt-4">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                <ImageIcon className="h-6 w-6 text-primary" />
            </Button>
            <div className="flex items-center gap-4">
                <span className={cn("text-sm", charsLeft < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {charsLeft}
                </span>
                <Button onClick={handleSubmit} disabled={(!content.trim() && !imagePreview) || isSubmitting || charsLeft < 0} className="rounded-full font-bold">
                    {isSubmitting ? "Posting..." : "Post"}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
