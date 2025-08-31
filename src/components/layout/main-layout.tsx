
"use client"

import { SidebarProvider, Sidebar } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { RightSidebar } from './right-sidebar'
import { MainHeader } from './main-header'

function AppBody({ children }: { children: React.React.Node }) {
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
  const isHomePage = pathname === '/';

  if (!showAppShell) {
      return <AppBody>{children}</AppBody>;
  }

  return (
    <AppBody>
      <MainHeader />
      <SidebarProvider>
        <div className="mx-auto max-w-screen-xl">
          <div className="flex justify-center">
              <aside className="w-auto xl:w-[275px] shrink-0">
                  <Sidebar className="sticky top-0 h-screen">
                    <MainSidebarNav />
                  </Sidebar>
              </aside>
              <div className="flex-1 border-x min-w-0 max-w-[1050px]">
                  {children}
              </div>
              {isHomePage && (
                <aside className="hidden lg:block w-[350px] pt-6 pl-6 shrink-0">
                  <RightSidebar />
                </aside>
              )}
          </div>
        </div>
      </SidebarProvider>
    </AppBody>
  )
}
