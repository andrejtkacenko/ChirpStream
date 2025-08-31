
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/auth/protected-route";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Music4 } from "lucide-react";
import { useState } from "react";

function StudioPageContent() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [trackName, setTrackName] = useState("");
    const [coverArtName, setCoverArtName] = useState("");
    const [audioFileName, setAudioFileName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackName || !coverArtName || !audioFileName) {
            toast({
                title: "Missing fields",
                description: "Please fill out all fields before uploading.",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        toast({
            title: "Uploading track...",
            description: `"${trackName}" is being uploaded.`,
        });

        // Simulate upload
        setTimeout(() => {
            setIsUploading(false);
            toast({
                title: "Upload successful!",
                description: `"${trackName}" is now live.`,
            });
            // Reset form
            setTrackName("");
            setCoverArtName("");
            setAudioFileName("");
        }, 2000);
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
                        <div className="space-y-2">
                            <Label htmlFor="cover-art">Cover Art</Label>
                            <Input 
                                id="cover-art" 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setCoverArtName(e.target.files?.[0]?.name || "")}
                                disabled={isUploading} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="audio-file">Audio File</Label>
                            <Input 
                                id="audio-file" 
                                type="file" 
                                accept="audio/*"
                                onChange={(e) => setAudioFileName(e.target.files?.[0]?.name || "")}
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
            <StudioPageContent />
        </ProtectedRoute>
    )
}
