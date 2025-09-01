
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { getTracks } from "@/lib/data";
import type { Track } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function MusicGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="p-0">
                        <div className="aspect-square relative">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function MusicPlayerModal({ track, onClose }: { track: Track; onClose: () => void; }) {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <Dialog open={!!track} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <div className="aspect-square relative w-full mt-4">
                       <Image src={track.cover} alt={track.title} layout="fill" className="rounded-lg object-cover" />
                    </div>
                    <DialogTitle className="text-center mt-4">{track.title}</DialogTitle>
                    <DialogDescription className="text-center">{track.artist}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <Progress value={33} className="h-2" />
                     <div className="flex items-center justify-center gap-6">
                        <Button variant="ghost" size="icon">
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button size="icon" className="w-16 h-16" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button variant="ghost" size="icon">
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function MusicPageContent() {
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            setLoading(true);
            const fetchedTracks = await getTracks();
            setTracks(fetchedTracks);
            setLoading(false);
        }
        fetchTracks();
    }, []);

    if (loading) {
        return <MusicGridSkeleton />;
    }

    return (
        <main>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {tracks.map(track => (
                    <Card key={track.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTrack(track)}>
                        <CardHeader className="p-0">
                            <div className="aspect-square relative">
                                <Image src={track.cover} alt={track.title} layout="fill" className="rounded-t-lg object-cover" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="font-bold truncate">{track.title}</p>
                            <Link href={`/${track.artistUsername}`} onClick={(e) => e.stopPropagation()}>
                                <p className="text-sm text-muted-foreground truncate hover:underline">{track.artist}</p>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {tracks.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No music has been uploaded yet.</p>
                </div>
            )}
            {selectedTrack && <MusicPlayerModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
        </main>
    )
}


export default function MusicPage() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <MusicPageContent />
            </MainLayout>
        </ProtectedRoute>
    )
}
