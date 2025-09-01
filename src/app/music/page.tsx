
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";

const musicTracks = [
  {
    id: 1,
    title: "Midnight City",
    artist: "M83",
    cover: "https://picsum.photos/seed/midnight/400/400",
  },
  {
    id: 2,
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "https://picsum.photos/seed/blinding/400/400",
  },
  {
    id: 3,
    title: "As It Was",
    artist: "Harry Styles",
    cover: "https://picsum.photos/seed/asitwas/400/400",
  },
  {
    id: 4,
    title: "Bohemian Rhapsody",
    artist: "Queen",
    cover: "https://picsum.photos/seed/queen/400/400",
  },
  {
    id: 5,
    title: "Levitating",
    artist: "Dua Lipa",
    cover: "https://picsum.photos/seed/levitating/400/400",
  },
  {
    id: 6,
    title: "Shape of You",
    artist: "Ed Sheeran",
    cover: "https://picsum.photos/seed/shapeofyou/400/400",
  },
   {
    id: 7,
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    cover: "https://picsum.photos/seed/uptown/400/400",
  },
  {
    id: 8,
    title: "Rolling in the Deep",
    artist: "Adele",
    cover: "https://picsum.photos/seed/adele/400/400",
  },
];

type MusicTrack = typeof musicTracks[0];

function MusicPlayerModal({ track, onClose }: { track: MusicTrack; onClose: () => void; }) {
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
    const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);

    return (
        <main>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {musicTracks.map(track => (
                    <Card key={track.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTrack(track)}>
                        <CardHeader className="p-0">
                            <div className="aspect-square relative">
                                <Image src={track.cover} alt={track.title} layout="fill" className="rounded-t-lg object-cover" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="font-bold truncate">{track.title}</p>
                            <Link href={`/artist/${encodeURIComponent(track.artist)}`} onClick={(e) => e.stopPropagation()}>
                                <p className="text-sm text-muted-foreground truncate hover:underline">{track.artist}</p>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
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
