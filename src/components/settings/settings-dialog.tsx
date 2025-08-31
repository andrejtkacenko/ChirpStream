
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Separator } from "../ui/separator";
import  SettingsProfilePage from "./profile-page";
import  SettingsArtistPage from "./artist-page";
import  SettingsAccountPage from "./account-page";
import  SettingsAppearancePage from "./appearance-page";
import  SettingsNotificationsPage from "./notifications-page";
import  SettingsDisplayPage from "./display-page";


const sidebarNavItems = [
  {
    id: "profile",
    title: "Profile",
  },
  {
    id: "account",
    title: "Account",
  },
  {
    id: "appearance",
    title: "Appearance",
  },
  {
    id: "notifications",
    title: "Notifications",
  },
  {
    id: "display",
    title: "Display",
  },
  {
    id: "artist",
    title: "Artist Account",
  },
];

const pageComponents: { [key: string]: React.ComponentType } = {
    profile: SettingsProfilePage,
    artist: SettingsArtistPage,
    account: SettingsAccountPage,
    appearance: SettingsAppearancePage,
    notifications: SettingsNotificationsPage,
    display: SettingsDisplayPage,
}

export function SettingsDialog({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState("profile");
    const ActivePageComponent = pageComponents[activeTab];

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl">Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings and set e-mail preferences.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-1/5 border-r p-4">
                        <SidebarNav items={sidebarNavItems} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </aside>
                    <main className="flex-1 p-6 overflow-y-auto">
                        {ActivePageComponent && <ActivePageComponent />}
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    )
}
