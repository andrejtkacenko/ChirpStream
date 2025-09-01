
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { updateUserProfile } from "@/lib/data";


const artistFormSchema = z.object({
  artistName: z
    .string()
    .min(2, {
      message: "Artist name must be at least 2 characters.",
    }),
  genre: z.string().min(2, { message: "Genre is required." }),
  bio: z.string().max(500).optional(),
});

type ArtistFormValues = z.infer<typeof artistFormSchema>;

export default function SettingsArtistPage() {
    const { appUser, refreshAppUser } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ArtistFormValues>({
        resolver: zodResolver(artistFormSchema),
        defaultValues: {
            artistName: "",
            genre: "",
            bio: "",
        },
        mode: "onChange",
    });

    async function onSubmit(data: ArtistFormValues) {
        if (!appUser) return;
        setIsSubmitting(true);
        
        // Simulate API call for review
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
             await updateUserProfile(appUser.id, { isArtist: true, hasSeenStudioNotification: false });
             await refreshAppUser();
             toast({
                title: "Congratulations!",
                description: "Your artist application has been approved. You now have access to the Creator Studio.",
            });
            form.reset();
        } catch (error) {
             toast({
                title: "Application failed",
                description: "Could not process your artist application.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (appUser?.isArtist) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Artist Account</h3>
                <p>Congratulations! You are already an approved artist. You can manage your music in the Creator Studio.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Become an Artist</h3>
                <p className="text-sm text-muted-foreground">
                   Submit your application to get access to the Creator Studio and share your music.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="artistName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Artist Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your official artist name" {...field} />
                            </FormControl>
                            <FormDescription>
                                This name will be displayed on your artist page and music tracks.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Main Genre</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g. Indie Pop, Electronic, Hip Hop" {...field} />
                            </FormControl>
                             <FormDescription>
                                What genre best describes your music?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Artist Bio</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Tell us about your musical journey..."
                                className="resize-none"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
