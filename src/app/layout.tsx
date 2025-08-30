
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

// Metadata can't be in a client component, so we export it from the server layout
const metadataConfig: Metadata = {
  title: 'ChirpStream',
  description: 'A modern social media experience.',
};

export { metadataConfig as metadata };


function AppBody({ children }: { children: React.ReactNode }) {
    const { appUser } = useAuth();
    const themeClass = appUser?.plan === 'premium' ? 'premium' : '';

    return (
        <html lang="en" className={cn("dark", themeClass)}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased">
                {children}
                <Toaster />
            </body>
        </html>
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AuthProvider>
        <AppBody>{children}</AppBody>
      </AuthProvider>
  );
}
