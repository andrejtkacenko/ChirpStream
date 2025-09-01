
"use client";

import { useEffect, useState }from "react";
import { useParams, notFound } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { getPostWithReplies, createPost } from "@/lib/data";
import type { PostWithAuthor } from "@/lib/types";
import { PostCard } from "@/components/chirpstream/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreatePostForm } from "@/components/chirpstream/create-post-form";
import { useAuth } from "@/context/auth-context";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

function PostPageSkeleton() {
  return (
    <div>
        <div className="p-4 border-b">
            <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-4 border-b">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
         <div className="p-4 border-b">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end">
                       <Skeleton className="h-10 w-20" />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-4 border-b">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    </div>
  );
}


function ReplyForm({ parentPost, onReplyPosted }: { parentPost: PostWithAuthor, onReplyPosted: () => void }) {
    const { appUser } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!appUser) return null;

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await createPost(appUser.id, content, [], parentPost.id);
            setContent("");
            toast({ title: "Success!", description: "Your reply has been posted." });
            onReplyPosted();
        } catch (error) {
            toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <div className="flex gap-4 p-4 border-b">
            <Avatar className="h-12 w-12">
                <AvatarImage src={appUser.avatar} />
                <AvatarFallback>{appUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full">
                <Textarea
                    placeholder={`Replying to @${parentPost.author.username}`}
                    className="bg-transparent border-0 focus-visible:ring-0 resize-none text-xl"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                />
                 <div className="flex justify-end items-center mt-2 pt-2">
                    <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="rounded-full font-bold">
                        {isSubmitting ? "Replying..." : "Reply"}
                    </Button>
                </div>
            </div>
        </div>
    )
}


function PostPageContent() {
    const params = useParams();
    const router = useRouter();
    const { postId } = params;

    const [post, setPost] = useState<PostWithAuthor | null>(null);
    const [replies, setReplies] = useState<PostWithAuthor[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPostData = async () => {
        setLoading(true);
        if (typeof postId !== 'string') return;
        const data = await getPostWithReplies(postId);
        if (!data) {
            notFound();
        }
        setPost(data.post);
        setReplies(data.replies);
        setLoading(false);
    }
    
    useEffect(() => {
        loadPostData();
    }, [postId]);

    if (loading || !post) {
        return <PostPageSkeleton />;
    }

    return (
        <main>
            <header className="p-4 border-b flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Post</h1>
            </header>
            
            <PostCard post={post} author={post.author} />
            <ReplyForm parentPost={post} onReplyPosted={loadPostData} />
            
            <Separator />
            
            {replies.length > 0 && (
                <div className="flex flex-col">
                    {replies.map(reply => (
                        <PostCard key={reply.id} post={reply} author={reply.author} />
                    ))}
                </div>
            )}
        </main>
    )
}

export default function PostPage() {
    return (
        <ProtectedRoute>
            <PostPageContent />
        </ProtectedRoute>
    );
}
