
"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
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

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function MusicPlayerModal({ track, onClose, onNext, onPrev }: { track: Track; onClose: () => void; onNext: () => void; onPrev: () => void; }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            onNext();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);
        
        if (isPlaying) {
            audio.play().catch(e => console.error("Playback failed:", e));
        } else {
            audio.pause();
        }

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [track, isPlaying, onNext]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };
    
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }
    
    const handleProgressChange = (value: number[]) => {
        if (audioRef.current) {
            const newTime = (value[0] / 100) * duration;
            audioRef.current.currentTime = newTime;
        }
    }

    return (
        <Dialog open={!!track} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
                <DialogHeader>
                    <div className="aspect-square relative w-full mt-4">
                       <Image src={track.cover} alt={track.title} layout="fill" className="rounded-lg object-cover" />
                    </div>
                    <DialogTitle className="text-center mt-4">{track.title}</DialogTitle>
                    <DialogDescription className="text-center">{track.artist}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                     <div className="flex items-center justify-center gap-6">
                        <Button variant="ghost" size="icon" onClick={onPrev}>
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button size="icon" className="w-16 h-16" onClick={togglePlayPause}>
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext}>
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-center">
                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                           {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function MusicPageContent() {
    const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
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

    const handleNextTrack = () => {
        if (selectedTrackIndex === null) return;
        setSelectedTrackIndex((prevIndex) => {
            if (prevIndex === null) return null;
            return (prevIndex + 1) % tracks.length;
        });
    };

    const handlePrevTrack = () => {
        if (selectedTrackIndex === null) return;
        setSelectedTrackIndex((prevIndex) => {
            if (prevIndex === null) return null;
            return (prevIndex - 1 + tracks.length) % tracks.length;
        });
    };

    if (loading) {
        return <MusicGridSkeleton />;
    }

    const selectedTrack = selectedTrackIndex !== null ? tracks[selectedTrackIndex] : null;

    return (
        <main>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {tracks.map((track, index) => (
                    <Card key={track.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTrackIndex(index)}>
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
            {selectedTrack && (
                 <MusicPlayerModal 
                    track={selectedTrack} 
                    onClose={() => setSelectedTrackIndex(null)}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                 />
            )}
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
