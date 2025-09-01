
"use client"

import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { RightSidebar } from './right-sidebar'
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
        <div className={cn("h-full", themeClass)}>
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
      <SidebarProvider>
         <div className="flex">
            <Sidebar>
              <MainSidebarNav />
            </Sidebar>
            <main className="flex-1">
              <MainHeader />
              <div className="flex justify-center">
                  <div className="w-full max-w-[700px] border-x min-w-0">
                      {children}
                  </div>
                  <aside className="hidden lg:block w-[350px] pt-6 pl-6 shrink-0">
                    <RightSidebar />
                  </aside>
              </div>
            </main>
        </div>
      </SidebarProvider>
    </AppBody>
  )
}
