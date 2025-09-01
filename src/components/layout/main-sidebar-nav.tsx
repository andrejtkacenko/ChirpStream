
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Home, LogIn, Mail, Search, User, Wind, UserPlus, LogOut, Check, Gem, Feather, Bookmark, Settings, Music, Music4 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from '../ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'
import type { User as FirebaseUser } from 'firebase/auth'
import { cn } from '@/lib/utils'
import { SettingsDialog } from '../settings/settings-dialog'
import { useToast } from '@/hooks/use-toast'
import { markStudioNotificationAsSeen } from '@/lib/data'

export function MainSidebarNav() {
  const pathname = usePathname()
  const router = useRouter();
  const { appUser, loading, logout, switchUser, users: firebaseUsers, appUsers, refreshAppUser } = useAuth();
  const { toast } = useToast();
  
  const menuItems = appUser ? [
    { href: '/', label: 'Home', icon: Home, requiredPlan: 'any' },
    { href: '/explore', label: 'Explore', icon: Search, requiredPlan: 'any' },
    { href: '/notifications', label: 'Notifications', icon: Bell, requiredPlan: 'any' },
    { href: '/messages', label: 'Messages', icon: Mail, requiredPlan: 'any' },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark, requiredPlan: 'any' },
    { href: '/music', label: 'Music', icon: Music, requiredPlan: 'any' },
    { href: '/studio', label: 'Studio', icon: Music4, requiredArtist: true, id: 'studio' },
    { href: '/premium', label: 'Premium', icon: Gem, requiredPlan: 'any' },
    { href: `/${appUser.username}`, label: 'Profile', icon: User, requiredPlan: 'any' },
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

  const handleStudioClick = async () => {
    if (appUser && appUser.isArtist && !appUser.hasSeenStudioNotification) {
      try {
        await markStudioNotificationAsSeen(appUser.id);
        await refreshAppUser();
      } catch (error) {
        toast({ title: "Error", description: "Could not update notification status." });
      }
    }
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
    <div className="flex flex-col h-full items-center">
      <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="flex items-center gap-2">
              <Wind className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg hidden lg:inline">ChirpStream</span>
          </Link>
      </div>
      <nav className="flex flex-col gap-1 w-full items-center">
        {appUser && menuItems.map((item) => {
            if (item.requiredArtist && !appUser.isArtist) {
              return null;
            }
            const showGlow = item.id === 'studio' && appUser.isArtist && !appUser.hasSeenStudioNotification;

            return (
              <Link href={item.href} key={item.label} onClick={item.id === 'studio' ? handleStudioClick : undefined} className="w-full flex justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "font-semibold text-lg justify-start w-auto lg:w-full",
                      isActive(item.href) && "bg-accent",
                      showGlow && "animate-glow"
                    )}
                  >
                    <item.icon className="h-6 w-6 lg:mr-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
              </Link>
            )
          })}
        {appUser && (
          <div className="w-full flex justify-center">
            <SettingsDialog>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                      "font-semibold text-lg justify-start w-auto lg:w-full",
                      pathname.startsWith('/settings') && "bg-accent"
                  )}
                >
                  <Settings className="h-6 w-6 lg:mr-4" />
                  <span className="hidden lg:inline">Settings</span>
                </Button>
            </SettingsDialog>
          </div>
        )}
        {!appUser && !loading && (
            <Link href="/login" className="w-full flex justify-center">
                <Button
                    variant="ghost"
                    size="lg"
                    className={cn("font-semibold text-lg justify-start w-auto lg:w-full", isActive('/login') && "bg-accent")}
                >
                    <LogIn className="h-6 w-6 lg:mr-4" />
                    <span className="hidden lg:inline">Login</span>
                </Button>
            </Link>
        )}
      </nav>
      {appUser && (
        <Button size="lg" className="rounded-full font-bold text-lg w-auto lg:w-full mt-4">
            <Feather className="h-6 w-6 lg:mr-2" />
            <span className="hidden lg:inline">Post</span>
        </Button>
      )}
      <div className="mt-auto w-full">
        {appUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-16 p-2">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-3 items-center">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={appUser.avatar ?? undefined} alt={appUser.name ?? ''} />
                        <AvatarFallback>{appUser.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden lg:inline">
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
      </div>
    </div>
  )
}
