'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Home, LogIn, Mail, Search, User, Wind } from 'lucide-react'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'

export function MainSidebarNav() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth();

  const isActive = (path: string) => pathname === path

  const menuItems = user ? [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: `/${user.username}`, label: 'Profile', icon: User },
  ] : [];

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
          {user && menuItems.map((item) => (
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
          {!user && !loading && (
             <SidebarMenuItem>
              <Link href="/login">
                <SidebarMenuButton
                  isActive={isActive('/login')}
                  tooltip="Login"
                  asChild={false}
                >
                  <LogIn />
                  <span>Login</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-14">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                      <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden group-data-[state=expanded]:block">
                      <p className="font-bold">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64 mb-2">
              <DropdownMenuItem onClick={logout}>Log out @{user.username}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </>
  )
}
