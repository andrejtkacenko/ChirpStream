"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

function AuthLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
             <div className="w-full max-w-md p-8 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}
