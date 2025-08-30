'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Home, Mail, Search, User, Wind } from 'lucide-react'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { currentUser } from '@/lib/data'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

export function MainSidebarNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: `/${currentUser.username}`, label: 'Profile', icon: User },
  ]

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Home">
            <Wind className="w-6 h-6 text-primary" />
          </Button>
          <span className="text-xl font-bold">ChirpStream</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  asChild={false}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-14">
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-3 items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden group-data-[state=expanded]:block">
                    <p className="font-bold">{currentUser.name}</p>
                    <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-64 mb-2">
            <DropdownMenuItem>Log out @{currentUser.username}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  )
}
