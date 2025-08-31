
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Home, LogIn, Mail, Search, User, Wind, UserPlus, LogOut, Check, Gem, PanelLeft, Feather, Bookmark, Settings } from 'lucide-react'
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel } from '../ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'
import type { User as FirebaseUser } from 'firebase/auth'
import { cn } from '@/lib/utils'

export function MainSidebarNav() {
  const pathname = usePathname()
  const router = useRouter();
  const { appUser, loading, logout, switchUser, users: firebaseUsers, appUsers } = useAuth();
  
  const menuItems = appUser ? [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/premium', label: 'Premium', icon: Gem },
    { href: `/${appUser.username}`, label: 'Profile', icon: User },
    { href: '/settings/profile', label: 'Settings', icon: Settings },
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
    if (href === '/') return pathname === '/';
    if (href.startsWith('/')) {
        const profilePattern = /^\/[^/]+$/;
        if (profilePattern.test(href) && href.substring(1) === appUser?.username) {
            return pathname === `/${appUser.username}`;
        }
    }
    return pathname.startsWith(href);
  }
  
  return (
    <>
      <SidebarContent className="p-4 flex-grow">
        <div className="flex flex-col justify-between h-full">
            <SidebarMenu>
            {appUser && menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                    <SidebarMenuButton
                    size="lg"
                    isActive={isActive(item.href)}
                    tooltip={{children: item.label}}
                    asChild={false}
                    className={cn("font-semibold justify-center xl:justify-start")}
                    >
                    <item.icon className="h-6 w-6" />
                    <span className="text-lg hidden xl:flex">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            {!appUser && !loading && (
                <SidebarMenuItem>
                <Link href="/login">
                    <SidebarMenuButton
                    isActive={isActive('/login')}
                    tooltip={{children: "Login"}}
                    asChild={false}
                    className={cn('justify-center xl:justify-start')}
                    >
                    <LogIn />
                    <span className='hidden xl:flex'>Login</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            )}
            </SidebarMenu>
            <Button size="lg" className="rounded-full font-bold text-lg w-full xl:w-full w-12 h-12 p-0 xl:h-auto xl:p-2">
              <span className='hidden xl:flex'>Post</span>
              <Feather className="h-6 w-6 flex xl:hidden" />
            </Button>
        </div>
      </SidebarContent>
      <SidebarFooter className='p-4'>
        {appUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-16 p-0 xl:p-2 justify-center xl:justify-start">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={appUser.avatar ?? undefined} alt={appUser.name ?? ''} />
                      <AvatarFallback>{appUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden xl:block">
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
