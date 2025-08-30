"use client"

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebarNav } from './main-sidebar-nav'
import type { ReactNode } from 'react'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainSidebarNav />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
