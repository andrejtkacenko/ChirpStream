
import ProtectedRoute from "@/components/auth/protected-route";
import { Bell } from "lucide-react";

function NotificationsPageContent() {
    return (
        <main>
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Bell className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-bold">No new notifications</h2>
                <p className="mt-2 text-muted-foreground">
                    When you get notifications, they will show up here.
                </p>
            </div>
        </main>
    )
}

export default function NotificationsPage() {
    return (
        <ProtectedRoute>
            <NotificationsPageContent />
        </ProtectedRoute>
    )
}
