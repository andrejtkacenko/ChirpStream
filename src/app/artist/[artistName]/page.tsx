
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/protected-route";
import Image from "next/image";
import { Check, Play, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const artistData: { [key: string]: any } = {
    "M83": {
        name: "M83",
        listeners: "15,8M Monthly Listeners",
        banner: "https://picsum.photos/seed/m83banner/1200/400",
        avatar: "https://picsum.photos/seed/midnight/400/400",
        isVerified: true,
        topTracks: [
            { id: 1, title: "Midnight City", plays: "1.2B", cover: "https://picsum.photos/seed/midnight/100/100" },
            { id: 2, title: "Outro", plays: "450M", cover: "https://picsum.photos/seed/outro/100/100" },
            { id: 3, title: "Wait", plays: "380M", cover: "https://picsum.photos/seed/wait/100/100" },
            { id: 4, title: "My Tears Are Becoming a Sea", plays: "250M", cover: "https://picsum.photos/seed/tears/100/100" },
            { id: 5, title: "Intro", plays: "210M", cover: "https://picsum.photos/seed/intro/100/100" },
        ]
    },
    "The Weeknd": {
        name: "The Weeknd",
        listeners: "110M Monthly Listeners",
        banner: "https://picsum.photos/seed/weekndbanner/1200/400",
        avatar: "https://picsum.photos/seed/blinding/400/400",
        isVerified: true,
        topTracks: [
            { id: 1, title: "Blinding Lights", plays: "4.1B", cover: "https://picsum.photos/seed/blinding/100/100" },
            { id: 2, title: "Starboy", plays: "2.5B", cover: "https://picsum.photos/seed/starboy/100/100" },
            { id: 3, title: "Save Your Tears", plays: "2.1B", cover: "https://picsum.photos/seed/saveyourtears/100/100" },
            { id: 4, title: "Die For You", plays: "1.9B", cover: "https://picsum.photos/seed/dieforyou/100/100" },
            { id: 5, title: "I Feel It Coming", plays: "1.5B", cover: "https://picsum.photos/seed/ifeelitcoming/100/100" },
        ]
    }
}


function ArtistPageContent() {
    const params = useParams();
    const artistName = decodeURIComponent(params.artistName as string);
    const artist = artistData[artistName] || artistData["M83"];

    return (
        <main>
            <div className="relative h-64 md:h-96 w-full">
                <Image src={artist.banner} alt={`${artist.name} banner`} layout="fill" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-8 left-8">
                    {artist.isVerified && (
                         <div className="flex items-center gap-2 text-sm text-white mb-2">
                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span>Verified Artist</span>
                        </div>
                    )}
                    <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter">{artist.name}</h1>
                    <p className="text-white mt-2 text-lg">{artist.listeners}</p>
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
                    {artist.topTracks.map((track: any, index: number) => (
                        <Card key={track.id} className="hover:bg-muted/50 transition-colors border-0">
                            <CardContent className="p-3 flex items-center gap-4">
                                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                                <Image src={track.cover} alt={track.title} width={40} height={40} className="rounded" />
                                <span className="font-medium flex-1 truncate">{track.title}</span>
                                <span className="text-muted-foreground text-sm">{track.plays}</span>
                            </CardContent>
                        </Card>
                    ))}
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
