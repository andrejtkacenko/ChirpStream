
"use client"

import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { MainHeader } from './main-header'
import { RightSidebar } from './right-sidebar'

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
  
  const showRightSidebar = !pathname.startsWith('/messages');

  return (
    <AppBody>
       <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl flex">
          <header className="fixed top-0 h-full w-20 lg:w-64 shrink-0 p-4">
              <MainSidebarNav />
          </header>
          <div className="ml-20 lg:ml-64 flex flex-1">
              <main className="flex-1 max-w-xl border-x w-full">
                  <MainHeader />
                  {children}
              </main>
              {showRightSidebar && (
                 <aside className="hidden md:block w-80 shrink-0 pt-6 pl-6">
                  <RightSidebar />
                 </aside>
              )}
          </div>
        </div>
      </div>
    </AppBody>
  )
}
