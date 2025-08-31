

"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { SidebarNav } from "@/components/settings/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/auth/protected-route";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Display",
    href: "/settings/display",
  },
  {
    title: "Artist Account",
    href: "/settings/artist",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

function SettingsLayoutContent({ children }: SettingsLayoutProps) {
  return (
    <>
        <div className="p-4 md:p-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                Manage your account settings and set e-mail preferences.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                <SidebarNav items={sidebarNavItems} />
                </aside>
                <div className="flex-1 lg:max-w-2xl">{children}</div>
            </div>
        </div>
    </>
  );
}


export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <ProtectedRoute>
            <SettingsLayoutContent>{children}</SettingsLayoutContent>
        </ProtectedRoute>
    )
}
