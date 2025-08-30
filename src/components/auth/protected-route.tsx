
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';
import { MainLayout } from '../layout/main-layout';

interface ProtectedRouteProps {
  children: ReactNode;
}

function AuthLoader() {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
             <div className="w-full max-w-md p-8 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
      </MainLayout>
    )
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isEmailVerified, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!isEmailVerified && pathname !== '/verify-email') {
      router.push('/verify-email');
      return;
    }

    if (isEmailVerified && pathname === '/verify-email') {
        router.push('/');
    }

  }, [user, isEmailVerified, loading, router, pathname]);

  if (loading || !user || (!isEmailVerified && pathname !== '/verify-email')) {
    return <AuthLoader />;
  }

  return <MainLayout>{children}</MainLayout>;
}
