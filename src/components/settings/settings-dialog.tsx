
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";


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

function SettingsContent({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
    const ActivePageComponent = pageComponents[activeTab];
    return (
        <>
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl">Settings</DialogTitle>
                <DialogDescription>
                    Manage your account settings and set e-mail preferences.
                </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="flex-grow flex overflow-hidden">
                <aside className="hidden md:block w-1/5 border-r p-4">
                    <SidebarNav items={sidebarNavItems} activeTab={activeTab} setActiveTab={setActiveTab} />
                </aside>
                <main className="flex-1 p-6 overflow-y-auto">
                    {ActivePageComponent && <ActivePageComponent />}
                </main>
            </div>
        </>
    )
}

export function SettingsDialog({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();
    
    if (isMobile) {
        return (
             <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{children}</DrawerTrigger>
                <DrawerContent className="h-[90vh] flex flex-col">
                    <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0">
                <SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
            </DialogContent>
        </Dialog>
    )
}
