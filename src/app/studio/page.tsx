
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { addTrack, getTracksByArtist } from "@/lib/data";
import { MainLayout } from "@/components/layout/main-layout";
import type { Track } from "@/lib/types";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function TracksSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function StudioPageContent() {
    const { toast } = useToast();
    const { appUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [trackName, setTrackName] = useState("");
    const [artistTracks, setArtistTracks] = useState<Track[]>([]);
    const [isLoadingTracks, setIsLoadingTracks] = useState(true);

    useEffect(() => {
        if (appUser?.isArtist) {
            fetchArtistTracks();
        }
    }, [appUser]);

    const fetchArtistTracks = async () => {
        if (!appUser) return;
        setIsLoadingTracks(true);
        const tracks = await getTracksByArtist(appUser.id);
        setArtistTracks(tracks);
        setIsLoadingTracks(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appUser || !appUser.isArtist) {
            toast({
                title: "Unauthorized",
                description: "You must be an artist to upload tracks.",
                variant: "destructive"
            });
            return;
        }

        if (!trackName) {
            toast({
                title: "Missing track name",
                description: "Please provide a name for your track.",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        toast({
            title: "Uploading track...",
            description: `"${trackName}" is being uploaded.`,
        });

        try {
            await addTrack({
                artistId: appUser.id,
                artistName: appUser.name,
                artistUsername: appUser.username,
                trackName: trackName,
            });
            
            toast({
                title: "Upload successful!",
                description: `"${trackName}" is now live.`,
            });
            setTrackName("");
            fetchArtistTracks(); // Refresh the list after upload

        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Could not upload your track. Please try again.",
                variant: "destructive"
            });
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Creator Studio</h1>
                <p className="text-muted-foreground">Upload and manage your music.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload a new track</CardTitle>
                        <CardDescription>Fill in the details below to add a new track to your profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="track-name">Track Name</Label>
                                <Input 
                                    id="track-name" 
                                    placeholder="e.g. Midnight City" 
                                    value={trackName}
                                    onChange={(e) => setTrackName(e.target.value)}
                                    disabled={isUploading}
                                />
                            </div>
                            <Button type="submit" className="w-full sm:w-auto" disabled={isUploading}>
                                {isUploading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Track</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Your Tracks</CardTitle>
                        <CardDescription>View, edit, or delete your uploaded music.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingTracks ? (
                            <TracksSkeleton />
                        ) : artistTracks.length > 0 ? (
                            <div className="space-y-2">
                                {artistTracks.map(track => (
                                    <div key={track.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <Image src={track.cover} alt={track.title} width={48} height={48} className="rounded-md" />
                                            <div>
                                                <p className="font-semibold">{track.title}</p>
                                                <p className="text-sm text-muted-foreground">{track.artist}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">You haven't uploaded any tracks yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default function StudioPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <StudioPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
