"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Post, User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { PostActions } from "./post-actions";

type PostCardProps = {
  post: Post;
  author: User;
};

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

export function PostCard({ post, author }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="border-0 border-b rounded-none last:border-b-0">
      <CardContent className="p-4 flex gap-4">
        <Link href={`/${author.username}`}>
          <Avatar>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/${author.username}`} className="font-bold hover:underline">
              {author.name}
            </Link>
            <span className="text-muted-foreground">@{author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground hover:underline">{timeAgo}</span>
          </div>
          <div className="text-base mt-1 whitespace-pre-wrap">
            {renderContent(post.content)}
          </div>
          <PostActions post={post} />
        </div>
      </CardContent>
    </Card>
  );
}