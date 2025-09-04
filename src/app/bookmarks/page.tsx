

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { getBookmarkedPosts, createBookmarkFolder, movePostToBookmarkFolder } from "@/lib/data";
import type { PostWithAuthor, User } from "@/lib/types";
import ProtectedRoute from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/chirpstream/post-card";
import { Bookmark, FolderPlus, MoreHorizontal, Folder, FolderOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function BookmarksSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="p-4 border-b">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
      </div>
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-start gap-4 p-4 border-b">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateFolderDialog({ open, onOpenChange, onFolderCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onFolderCreated: () => void }) {
    const { appUser } = useAuth();
    const { toast } = useToast();
    const [folderName, setFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!appUser || !folderName.trim()) return;
        setIsCreating(true);
        try {
            await createBookmarkFolder(appUser.id, folderName.trim());
            toast({ title: "Folder created!" });
            onFolderCreated();
            onOpenChange(false);
            setFolderName("");
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to create folder", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Folder</DialogTitle>
                    <DialogDescription>Create a new folder to organize your bookmarks.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input id="folder-name" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isCreating || !folderName.trim()}>
                        {isCreating ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function PostWithBookmarkActions({ post }: { post: PostWithAuthor }) {
  const { appUser, refreshAppUser } = useAuth();
  const { toast } = useToast();

  const handleMove = async (toFolderId: string) => {
    if (!appUser) return;
    
    // Find which folder the post is currently in
    let fromFolderId = 'root';
    if (appUser.bookmarkFolders) {
      const foundFolder = appUser.bookmarkFolders.find(f => f.postIds.includes(post.id));
      if (foundFolder) {
        fromFolderId = foundFolder.id;
      }
    }
    
    try {
      await movePostToBookmarkFolder(appUser.id, post.id, fromFolderId, toFolderId);
      await refreshAppUser();
      toast({ title: "Post moved" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to move post", variant: "destructive" });
    }
  }

  const isPremium = appUser?.plan === 'premium' || appUser?.plan === 'premium_plus';
  if (!isPremium) return <PostCard post={post} />;

  return (
    <div className="relative group">
       <PostCard post={post} />
       <div className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Move to folder</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                         <DropdownMenuItem onClick={() => handleMove('root')}>
                            All Bookmarks (unsorted)
                         </DropdownMenuItem>
                        {appUser?.bookmarkFolders?.map(folder => (
                          <DropdownMenuItem key={folder.id} onClick={() => handleMove(folder.id)}>
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
         </DropdownMenu>
       </div>
    </div>
  )
}


function BookmarksPageContent() {
  const { appUser, loading: authLoading, refreshAppUser } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const loadBookmarks = useCallback(async () => {
    if (!appUser) return;
    setLoading(true);
    const posts = await getBookmarkedPosts(appUser.id);
    setBookmarkedPosts(posts);
    setLoading(false);
  }, [appUser]);

  useEffect(() => {
    if (!authLoading) {
      loadBookmarks();
    }
  }, [authLoading, loadBookmarks]);
  
  const handleFolderCreated = () => {
    refreshAppUser();
  }
  
  const isPremium = appUser?.plan === 'premium' || appUser?.plan === 'premium_plus';

  const { unsortedPosts, postsByFolder } = useMemo(() => {
    if (!appUser) return { unsortedPosts: [], postsByFolder: {} };
    
    const unsorted = (appUser.bookmarks || []).map(postId => bookmarkedPosts.find(p => p.id === postId)).filter(Boolean) as PostWithAuthor[];
    
    const byFolder: { [folderId: string]: PostWithAuthor[] } = {};
    (appUser.bookmarkFolders || []).forEach(folder => {
        byFolder[folder.id] = folder.postIds.map(postId => bookmarkedPosts.find(p => p.id === postId)).filter(Boolean) as PostWithAuthor[];
    });

    return { unsortedPosts: unsorted, postsByFolder: byFolder };
  }, [appUser, bookmarkedPosts]);
  
  return (
    <main>
      <div className="p-4 border-b flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold">Bookmarks</h1>
            {appUser && <p className="text-muted-foreground">@{appUser.username}</p>}
        </div>
        {isPremium && (
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New folder
            </Button>
        )}
      </div>
      
      {loading || authLoading ? <BookmarksSkeleton /> : (
        isPremium ? (
             <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-14 overflow-x-auto">
                    <TabsTrigger value="all" className="flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><FolderOpen className="mr-2 h-4 w-4" />All</TabsTrigger>
                    <TabsTrigger value="unsorted" className="flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Bookmark className="mr-2 h-4 w-4" />Unsorted</TabsTrigger>
                    {appUser?.bookmarkFolders?.map(folder => (
                        <TabsTrigger key={folder.id} value={folder.id} className="flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Folder className="mr-2 h-4 w-4" />{folder.name}</TabsTrigger>
                    ))}
                </TabsList>
                 <TabsContent value="all">
                    {bookmarkedPosts.map((post) => <PostWithBookmarkActions key={post.id} post={post} />)}
                 </TabsContent>
                 <TabsContent value="unsorted">
                    {unsortedPosts.map((post) => <PostWithBookmarkActions key={post.id} post={post} />)}
                 </TabsContent>
                 {appUser?.bookmarkFolders?.map(folder => (
                     <TabsContent key={folder.id} value={folder.id}>
                        {(postsByFolder[folder.id] || []).map((post) => <PostWithBookmarkActions key={post.id} post={post} />)}
                     </TabsContent>
                 ))}
            </Tabs>
        ) : (
             bookmarkedPosts.length > 0 ? (
              <div className="flex flex-col">
                {bookmarkedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 flex flex-col items-center justify-center h-[60vh]">
                <Bookmark className="h-16 w-16 text-muted-foreground" />
                 <h2 className="mt-6 text-2xl font-bold">No Bookmarks Yet</h2>
                <p className="mt-2 text-muted-foreground">
                  Save posts to find them easily later.
                </p>
              </div>
            )
        )
      )}
      <CreateFolderDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} onFolderCreated={handleFolderCreated} />
    </main>
  );
}


export default function BookmarksPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <BookmarksPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
