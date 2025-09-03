
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/protected-route";
import Image from "next/image";
import { Check, Play, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByUsername, getTracksByArtist } from "@/lib/data";
import type { User, Track } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const artistData: { [key: string]: any } = {
    "M83": {
        listeners: "15,8M Monthly Listeners",
        banner: "https://picsum.photos/seed/m83banner/1200/400",
        isVerified: true,
    },
    "The Weeknd": {
        listeners: "110M Monthly Listeners",
        banner: "https://picsum.photos/seed/weekndbanner/1200/400",
        isVerified: true,
    }
}

function ArtistPageSkeleton() {
    return (
        <div>
            <div className="relative h-64 md:h-96 w-full">
                <Skeleton className="h-full w-full" />
                <div className="absolute bottom-8 left-8">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-20 w-64 mb-2" />
                    <Skeleton className="h-6 w-48" />
                </div>
            </div>
            <div className="p-8">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-md" />
                </div>
                <Skeleton className="h-8 w-40 mt-12 mb-4" />
                <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, i) => (
                         <Card key={i} className="border-0">
                            <CardContent className="p-3 flex items-center gap-4">
                                <Skeleton className="h-5 w-6" />
                                <Skeleton className="h-10 w-10 rounded" />
                                <Skeleton className="h-5 flex-1" />
                                <Skeleton className="h-5 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}


function ArtistPageContent() {
    const params = useParams();
    const artistNameParam = decodeURIComponent(params.artistName as string);
    
    const [artist, setArtist] = useState<User | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            setLoading(true);
            const user = await getUserByUsername(artistNameParam);
            if (!user) {
                notFound();
                return;
            }
            setArtist(user);

            const artistTracks = await getTracksByArtist(user.id);
            setTracks(artistTracks);
            
            setLoading(false);
        }
        fetchArtistData();
    }, [artistNameParam]);
    
    if (loading || !artist) {
        return <ArtistPageSkeleton />;
    }

    const artistStaticData = artistData[artist.name] || artistData["M83"];

    return (
        <main>
            <div className="relative h-64 md:h-96 w-full">
                <Image src={artistStaticData.banner} alt={`${artist.name} banner`} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-8 left-8">
                    {artistStaticData.isVerified && (
                         <div className="flex items-center gap-2 text-sm text-white mb-2">
                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span>Verified Artist</span>
                        </div>
                    )}
                    <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter">{artist.name}</h1>
                    <p className="text-white mt-2 text-lg">{artistStaticData.listeners}</p>
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-center gap-4">
                    <Button size="icon" className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600">
                        <Play className="h-8 w-8 fill-black text-black" />
                    </Button>
                    <Button variant="outline" size="lg">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Follow
                    </Button>
                </div>
                
                <h2 className="text-2xl font-bold mt-12 mb-4">Popular</h2>
                <div className="flex flex-col gap-2">
                    {tracks.map((track: any, index: number) => (
                        <Card key={track.id} className="hover:bg-muted/50 transition-colors border-0">
                            <CardContent className="p-3 flex items-center gap-4">
                                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                                <Image src={track.cover} alt={track.title} width={40} height={40} className="rounded" />
                                <span className="font-medium flex-1 truncate">{track.title}</span>
                                <span className="text-muted-foreground text-sm">{((track.title.length * (index + 1) * 12345) % 10000) / 10}M</span>
                            </CardContent>
                        </Card>
                    ))}
                    {tracks.length === 0 && (
                        <p className="text-muted-foreground">This artist hasn't uploaded any tracks yet.</p>
                    )}
                </div>
            </div>

        </main>
    )
}

export default function ArtistPage() {
    return (
        <ProtectedRoute>
            <ArtistPageContent />
        </ProtectedRoute>
    )
}
