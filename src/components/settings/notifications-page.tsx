
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/data";
import type { User } from "@/lib/types";
import { useState, useEffect } from "react";


type NotificationSettings = NonNullable<User['notificationSettings']>;

const defaultSettings: NotificationSettings = {
    newFollowers: true,
    postLikes: true,
    postReplies: false,
    directMessages: true,
};

export default function SettingsNotificationsPage() {
    const { appUser, refreshAppUser, loading } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (appUser?.notificationSettings) {
            setSettings({ ...defaultSettings, ...appUser.notificationSettings });
        }
    }, [appUser]);

    const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        if (!appUser) return;
        setIsSaving(true);
        try {
            await updateUserProfile(appUser.id, { notificationSettings: settings });
            await refreshAppUser();
            toast({
                title: "Settings saved",
                description: "Your notification preferences have been updated.",
            });
            setHasChanges(false);
        } catch (error) {
            toast({
                title: "Error saving settings",
                description: "Could not update your preferences. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }


    const notificationItems: { id: keyof NotificationSettings; label: string; description: string }[] = [
        { id: "newFollowers", label: "New followers", description: "When someone starts following you." },
        { id: "postLikes", label: "Post likes", description: "When someone likes one of your posts." },
        { id: "postReplies", label: "Replies", description: "When someone replies to your post or thread." },
        { id: "directMessages", label: "Direct messages", description: "When you receive a new direct message." },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>
                        Select the kinds of notifications you want to receive.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {notificationItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between space-x-4">
                            <Label htmlFor={item.id} className="flex flex-col space-y-1">
                                <span>{item.label}</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    {item.description}
                                </span>
                            </Label>
                            <Switch 
                                id={item.id} 
                                checked={settings[item.id]}
                                onCheckedChange={(checked) => handleSettingChange(item.id, checked)}
                                disabled={loading}
                             />
                        </div>
                    ))}
                </CardContent>
            </Card>

             <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges}>
                {isSaving ? "Saving..." : "Save preferences"}
            </Button>
        </div>
    )
}
