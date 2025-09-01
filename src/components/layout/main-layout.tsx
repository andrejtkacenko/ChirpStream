
"use client"

import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { MainHeader } from './main-header'

function AppBody({ children }: { children: React.ReactNode }) {
    const context = useAuth();
    let themeClass = '';
    if (context?.appUser?.plan === 'premium') {
        themeClass = 'premium';
    } else if (context?.appUser?.plan === 'premium_plus') {
        themeClass = 'premium-plus';
    }

    return (
        <div className={cn("min-h-screen", themeClass)}>
            {children}
            <Toaster />
        </div>
    )
}

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading, isEmailVerified } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';
  const showAppShell = !loading && user && isEmailVerified && !isAuthPage;

  if (!showAppShell) {
      return <AppBody>{children}</AppBody>;
  }

  return (
    <AppBody>
       <div className="container mx-auto flex">
          <header className="w-72 shrink-0 p-4">
            <div className="sticky top-0">
              <MainSidebarNav />
            </div>
          </header>
          <main className="flex-1 max-w-[600px] border-x">
            <MainHeader />
            {children}
          </main>
      </div>
    </AppBody>
  )
}
