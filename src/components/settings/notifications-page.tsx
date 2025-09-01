
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

export default function SettingsNotificationsPage() {
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
                    <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="new-followers" className="flex flex-col space-y-1">
                            <span>New followers</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                When someone starts following you.
                            </span>
                        </Label>
                        <Switch id="new-followers" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="post-likes" className="flex flex-col space-y-1">
                            <span>Post likes</span>
                             <span className="font-normal leading-snug text-muted-foreground">
                                When someone likes one of your posts.
                            </span>
                        </Label>
                        <Switch id="post-likes" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="post-replies" className="flex flex-col space-y-1">
                            <span>Replies</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                When someone replies to your post or thread.
                            </span>
                        </Label>
                        <Switch id="post-replies" />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                        <Label htmlFor="direct-messages" className="flex flex-col space-y-1">
                            <span>Direct messages</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                When you receive a new direct message.
                            </span>
                        </Label>
                        <Switch id="direct-messages" defaultChecked />
                    </div>
                </CardContent>
            </Card>

             <Button disabled>Save preferences</Button>
             <p className="text-sm text-muted-foreground">
                Saving preferences is not yet implemented.
             </p>
        </div>
    )
}
