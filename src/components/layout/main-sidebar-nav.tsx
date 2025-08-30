
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Home, LogIn, Mail, Search, User, Wind, UserPlus, LogOut, Check, Gem, PanelLeft, Feather, Bookmark } from 'lucide-react'
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
  const { state: sidebarState, toggleSidebar } = useSidebar();

  const menuItems = appUser ? [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/premium', label: 'Premium', icon: Gem },
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
    if (href === '/') return pathname === '/';
    if (href.startsWith('/')) {
        const profilePattern = /^\/[^/]+$/;
        if (profilePattern.test(href) && href.substring(1) === appUser?.username) {
            return pathname === `/${appUser.username}`;
        }
    }
    return pathname.startsWith(href);
  }
  
  const renderBrand = () => (
    <Link href="/" className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Home" className='shrink-0'>
        <Wind className="w-6 h-6 text-primary" />
      </Button>
      {sidebarState === 'expanded' && <span className="text-xl font-bold">ChirpStream</span>}
    </Link>
  )

  return (
    <>
      <SidebarHeader className='p-4'>
        <div className={cn("flex", sidebarState === 'expanded' ? "justify-between" : "justify-center")}>
          {sidebarState === 'expanded' ? renderBrand() : <SidebarTrigger className='md:hidden' />}
           <SidebarTrigger className={cn(sidebarState === 'expanded' ? 'block' : 'hidden md:block')} />
        </div>
      </SidebarHeader>
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
                    className={cn("font-semibold", sidebarState === 'collapsed' && 'justify-center')}
                    >
                    <item.icon className="h-6 w-6" />
                    {sidebarState === 'expanded' && <span className="text-lg">{item.label}</span>}
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
                    className={cn(sidebarState === 'collapsed' && 'justify-center')}
                    >
                    <LogIn />
                    {sidebarState === 'expanded' && <span>Login</span>}
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            )}
            </SidebarMenu>
            <Button size="lg" className={cn("rounded-full font-bold text-lg", sidebarState === 'collapsed' ? "w-12 h-12 p-0" : "w-full")}>
              {sidebarState === 'expanded' && <span>Post</span>}
              {sidebarState === 'collapsed' && <Feather className="h-6 w-6" />}
            </Button>
        </div>
      </SidebarContent>
      <SidebarFooter className='p-4'>
        {appUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start h-16", sidebarState === 'collapsed' ? "p-0 w-12 h-12" : "")}>
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={appUser.avatar ?? undefined} alt={appUser.name ?? ''} />
                      <AvatarFallback>{appUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {sidebarState === 'expanded' && (
                        <div className="text-left">
                            <p className="font-bold">{appUser.name}</p>
                            <p className="text-sm text-muted-foreground">@{appUser.username}</p>
                        </div>
                    )}
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
