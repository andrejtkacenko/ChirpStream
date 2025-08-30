
"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { Container } from '../ui/container'

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
        <Container>
          <div className="flex min-h-screen">
              {showSidebar && <Sidebar>
                <MainSidebarNav />
              </Sidebar>}
              <div className="flex-1 flex">
                  <div className="w-full">
                    {children}
                  </div>
              </div>
          </div>
        </Container>
      </SidebarProvider>
    </AppBody>
  )
}
