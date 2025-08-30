
"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'

function AppBody({ children }: { children: React.ReactNode }) {
    const context = useAuth();
    let themeClass = '';
    if (context?.appUser?.plan === 'premium') {
        themeClass = 'premium';
    } else if (context?.appUser?.plan === 'premium_plus') {
        themeClass = 'premium-plus';
    }


    return (
        <div className={cn("dark h-full", themeClass)}>
            {children}
            <Toaster />
        </div>
    )
}


export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading, isEmailVerified } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';
  const showSidebar = !loading && user && isEmailVerified && !isAuthPage;

  return (
    <AppBody>
      <SidebarProvider>
        <div className="flex min-h-screen justify-center">
            <div className="w-full max-w-7xl flex">
              {showSidebar && <Sidebar>
                <MainSidebarNav />
              </Sidebar>}
              <div className="flex-1 flex justify-center">
                  <div className="w-full">
                    {children}
                  </div>
              </div>
            </div>
        </div>
      </SidebarProvider>
    </AppBody>
  )
}
