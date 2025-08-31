

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
import { useAuth } from "@/context/auth-context";
import { updateUserProfile } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  name: z.string().min(1, { message: "Name is required." }).max(50),
  bio: z.string().max(160).optional(),
  avatar: z.string().url({ message: "Please enter a valid URL." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePageContent() {
  const { appUser, refreshAppUser, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: appUser?.username || "",
      name: appUser?.name || "",
      bio: appUser?.bio || "",
      avatar: appUser?.avatar || "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!appUser) return;
    setIsSubmitting(true);
    
    try {
        await updateUserProfile(appUser.id, data);
        await refreshAppUser();
        toast({
            title: "Profile updated",
            description: "Your profile information has been successfully updated.",
        });
        form.reset(data); // Reset form with new values to clear dirty state
    } catch(e: any) {
        toast({
            title: "Update failed",
            description: e.message || "An error occurred while updating your profile.",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading || !appUser) {
    return <ProfileFormSkeleton />;
  }
  
  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">
                This is how others will see you on the site.
            </p>
        </div>
        <Separator />
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardContent className="pt-6">
                    <FormField
                        control={form.control}
                        name="avatar"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Avatar</FormLabel>
                                <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={field.value} />
                                    <AvatarFallback>{appUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <FormControl>
                                    <Input placeholder="https://example.com/avatar.png" {...field} />
                                </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                         )}
                    />
                </CardContent>
            </Card>

            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                    <Input placeholder="your_username" {...field} />
                    </FormControl>
                    <FormDescription>
                    This is your public display name. It can be your real name or a
                    pseudonym. You can only change this once every 30 days.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                    <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormDescription>
                        This is the name that will be displayed on your profile and in posts.
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                    />
                    </FormControl>
                    <FormDescription>
                        You can <span>@mention</span> other users and organizations to link to them.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting ? "Updating..." : "Update profile"}
            </Button>
        </form>
        </Form>
    </div>
  );
}

function ProfileFormSkeleton() {
    return (
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator />
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    )
}

export default function SettingsProfilePage() {
    return (
        <ProfilePageContent />
    )
}
