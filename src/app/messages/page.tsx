
import ProtectedRoute from "@/components/auth/protected-route";
import { Mail } from "lucide-react";

function MessagesPageContent() {
    return (
        <main>
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Mail className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-bold">No messages yet</h2>
                <p className="mt-2 text-muted-foreground">
                    When you have messages, they will show up here.
                </p>
            </div>
        </main>
    )
}


export default function MessagesPage() {
    return (
        <ProtectedRoute>
            <MessagesPageContent />
        </ProtectedRoute>
    )
}
