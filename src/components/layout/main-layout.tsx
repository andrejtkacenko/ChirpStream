
"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { usePathname } from 'next/navigation'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading, isEmailVerified } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';
  const showSidebar = !loading && user && isEmailVerified && !isAuthPage;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar>
          <MainSidebarNav />
        </Sidebar>}
        <div className="flex-1 flex justify-center">
            <div className="w-full max-w-5xl">
              {children}
            </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
