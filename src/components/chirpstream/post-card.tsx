
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Post, User, PostWithAuthor } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { PostActions } from "./post-actions";
import { Crown, MoreHorizontal, Trash2, Edit, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePost, updatePost } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserProfileHoverCard } from "./user-profile-hover-card";

type PostCardProps = {
  post: PostWithAuthor;
  author: User; // Author is now part of the post prop, but we keep it for consistency
};

const MAX_IMAGES = 4;

const renderContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const PostImageGrid = ({
  imageUrls,
  isEditing,
  onRemoveImage,
}: {
  imageUrls: string[];
  isEditing?: boolean;
  onRemoveImage?: (index: number) => void;
}) => {
  const count = imageUrls.length;
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "mt-3 grid max-h-[512px] gap-1 rounded-2xl border overflow-hidden",
        count === 1 && "grid-cols-1",
        count > 1 && "grid-cols-2",
        count === 3 && "grid-rows-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {imageUrls.map((url, index) => {
        let containerClassName = "";
        if (count === 3 && index === 0) {
          containerClassName = "row-span-2";
        }
         return (
          <div
            key={index}
            className={cn(
              "relative group aspect-video",
              containerClassName
            )}
          >
            <Image
              src={url}
              alt={`Post image ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover w-full h-full"
            />
            {isEditing && onRemoveImage && (
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/75 rounded-full h-6 w-6 z-10"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};


export function PostCard({ post, author }: PostCardProps) {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImageUrls, setEditedImageUrls] = useState(post.imageUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPostDate = () => {
    if (!post.createdAt) return new Date();
    if (post.createdAt instanceof Timestamp) {
      return post.createdAt.toDate();
    }
    // Firestore Timestamps can be serialized to an object with seconds and nanoseconds
    if (typeof post.createdAt === 'object' && 'seconds' in post.createdAt) {
      return new Timestamp(post.createdAt.seconds, post.createdAt.nanoseconds).toDate();
    }
    return new Date(post.createdAt as string);
  };

  const timeAgo = formatDistanceToNow(getPostDate(), { addSuffix: true });
  const isAuthor = appUser?.id === author.id;

  const handleEditClick = () => {
    setEditedContent(post.content);
    setEditedImageUrls(post.imageUrls || []);
    setIsEditing(true);
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
    setEditedImageUrls(post.imageUrls || []);
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast({ title: "Post deleted" });
      router.refresh(); // Or optimistically remove from UI
    } catch (error) {
      toast({ title: "Failed to delete post", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleUpdate = async () => {
    if (editedContent.trim() === post.content.trim() && JSON.stringify(editedImageUrls) === JSON.stringify(post.imageUrls || [])) {
        setIsEditing(false);
        return;
    }
    try {
        await updatePost(post.id, {
            content: editedContent,
            imageUrls: editedImageUrls,
        });
        toast({ title: "Post updated" });
        post.content = editedContent; // Mutate post object for immediate UI update
        post.imageUrls = editedImageUrls;
    } catch (error) {
        toast({ title: "Failed to update post", variant: "destructive" });
    } finally {
        setIsEditing(false);
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        if (editedImageUrls.length + files.length > MAX_IMAGES) {
            toast({
                title: "Too many images",
                description: `You can only upload a maximum of ${MAX_IMAGES} images.`,
                variant: "destructive"
            });
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedImageUrls(prev => [...prev, reader.result as string]);
            }
            reader.readAsDataURL(file);
        })
    }
  }

  const removeImage = (index: number) => {
    setEditedImageUrls(previews => previews.filter((_, i) => i !== index));
  }

  return (
    <Card className="border-0 border-b rounded-none last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors duration-200 bg-card" onClick={() => !isEditing && router.push(`/${author.username}/status/${post.id}`)}>
      <CardContent className="p-4 flex gap-4">
        <UserProfileHoverCard user={author}>
            <Link href={`/${author.username}`} onClick={(e) => e.stopPropagation()}>
            <Avatar className="h-12 w-12">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            </Link>
        </UserProfileHoverCard>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 text-sm">
            <UserProfileHoverCard user={author}>
                <Link href={`/${author.username}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline">
                {author.name}
                </Link>
            </UserProfileHoverCard>
            {(author.plan === 'premium' || author.plan === 'premium_plus') && (
              <Crown className="h-4 w-4 text-primary" />
            )}
            <span className="text-muted-foreground">@{author.username}</span>
            <span className="text-muted-foreground">·</span>
            <Link href={`/${author.username}/status/${post.id}`} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:underline">{timeAgo}</Link>
            {isAuthor && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={handleEditClick}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleting(true)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {isEditing ? (
              <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                <Textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className="text-base" />
                <PostImageGrid imageUrls={editedImageUrls} isEditing={true} onRemoveImage={removeImage} />
                <div className="flex justify-between items-center mt-2 border-t pt-4">
                    <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" multiple />
                        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={editedImageUrls.length >= MAX_IMAGES}>
                            <ImageIcon className="h-6 w-6 text-primary" />
                        </Button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save</Button>
                    </div>
                </div>
              </div>
          ) : (
            <>
                <div className="text-base mt-1 whitespace-pre-wrap">
                    {renderContent(post.content)}
                </div>
                {post.imageUrls && post.imageUrls.length > 0 && (
                    <PostImageGrid imageUrls={post.imageUrls} />
                )}
                <PostActions post={post} />
            </>
          )}
        </div>
      </CardContent>

       <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
