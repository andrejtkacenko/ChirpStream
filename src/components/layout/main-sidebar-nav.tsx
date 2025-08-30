
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Home, LogIn, Mail, Search, User, Wind, UserPlus, LogOut, Check } from 'lucide-react'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel } from '../ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'
import type { User as FirebaseUser } from 'firebase/auth'

export function MainSidebarNav() {
  const pathname = usePathname()
  const router = useRouter();
  const { appUser, loading, logout, switchUser, users: firebaseUsers, appUsers } = useAuth();

  const menuItems = appUser ? [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: `/${appUser.username}`, label: 'Profile', icon: User },
  ] : [];

  const handleAddAccount = () => {
    router.push('/login');
  }

  const handleLogout = () => {
    logout(true); 
  }
  
  const handleSwitchUser = (user: FirebaseUser) => {
    switchUser(user);
  }

  const isActive = (href: string) => {
    // Special case for the profile page, which has a dynamic route
    if (href.startsWith('/')) {
        const profilePattern = /^\/[^/]+$/;
        if (profilePattern.test(href) && href.substring(1) === appUser?.username) {
            return pathname === `/${appUser.username}`;
        }
    }
    return pathname === href;
  }

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
          {appUser && menuItems.map((item) => (
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
          {!appUser && !loading && (
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
        {appUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-14">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={appUser.avatar ?? undefined} alt={appUser.name ?? ''} />
                      <AvatarFallback>{appUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden group-data-[state=expanded]:block">
                      <p className="font-bold">{appUser.name}</p>
                      <p className="text-sm text-muted-foreground">@{appUser.username}</p>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64 mb-2">
               <DropdownMenuGroup>
                {appUsers.map((u, i) => u && (
                  <DropdownMenuItem key={u.id} onClick={() => firebaseUsers[i] && handleSwitchUser(firebaseUsers[i]!)}>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-3 items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={u.avatar ?? undefined} alt={u.name ?? ''} />
                            <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-sm text-muted-foreground">@{u.username}</p>
                          </div>
                      </div>
                      {u.id === appUser.id && <Check className="h-4 w-4" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAddAccount}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add an existing account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </>
  )
}
