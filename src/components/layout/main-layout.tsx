
"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'
import { Toaster } from '../ui/toaster'
import { cn } from '@/lib/utils'
import { Container } from '../ui/container'
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
  const showSidebar = !loading && user && isEmailVerified && !isAuthPage;

  return (
    <AppBody>
      <SidebarProvider>
        <Container>
          <div className="flex min-h-screen">
              {showSidebar && (
                <Sidebar>
                  <MainSidebarNav />
                </Sidebar>
              )}
              <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-[600px] border-x">
                    {children}
                  </div>
              </div>
              {showSidebar && (
                <aside className="hidden lg:block w-[300px] pt-6 pl-6 border-l">
                  <RightSidebar />
                </aside>
              )}
          </div>
        </Container>
      </SidebarProvider>
    </AppBody>
  )
}
