
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";

export default function NotFoundPage() {
  return (
    <MainLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="mt-4 text-3xl font-semibold">Page Not Found</h2>
            <p className="mt-2 text-muted-foreground">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Button asChild className="mt-8">
                <Link href="/">Go back to Home</Link>
            </Button>
        </div>
    </MainLayout>
  );
}
