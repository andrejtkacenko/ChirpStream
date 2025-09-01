
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { addTrack } from "@/lib/data";
import { MainLayout } from "@/components/layout/main-layout";

function StudioPageContent() {
    const { toast } = useToast();
    const { appUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [trackName, setTrackName] = useState("");

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
            
            setIsUploading(false);
            toast({
                title: "Upload successful!",
                description: `"${trackName}" is now live.`,
            });
            setTrackName("");

        } catch (error) {
            setIsUploading(false);
            toast({
                title: "Upload failed",
                description: "Could not upload your track. Please try again.",
                variant: "destructive"
            });
            console.error("Upload error:", error);
        }
    };

    return (
        <main className="p-4 md:p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Creator Studio</h1>
                <p className="text-muted-foreground">Upload and manage your music.</p>
            </div>
            <Card className="max-w-2xl">
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
