"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  const showSidebar = !loading && user;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar>
          <MainSidebarNav />
        </Sidebar>}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
