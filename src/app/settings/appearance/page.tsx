
"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsAppearancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your app.
                </p>
            </div>
            <Separator />
            <p>Appearance settings coming soon.</p>
        </div>
    )
}
