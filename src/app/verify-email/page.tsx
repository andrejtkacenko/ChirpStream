
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { MainLayout } from '@/components/layout/main-layout';

export default function VerifyEmailPage() {
  const { user, refreshAppUser, loading, isEmailVerified, logout } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isEmailVerified) {
      router.push('/');
    }
  }, [loading, isEmailVerified, router]);
  
  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [loading, user, router]);


  useEffect(() => {
    const interval = setInterval(async () => {
        if(user) {
            await refreshAppUser();
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, refreshAppUser]);

  const handleResendEmail = async () => {
    if (!user) {
      toast({ title: 'You are not logged in.', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification link has been sent to your email address.',
      });
    } catch (err: any) {
      toast({
        title: 'Error Sending Email',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
                We've sent a verification link to <span className="font-semibold">{user?.email ?? 'your email'}</span>. Please check your inbox and click the link to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleResendEmail} disabled={isSending} className="w-full">
              {isSending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                <p>Clicked the link? The page will refresh automatically.</p>
            </div>
             <div className="mt-4 text-center text-sm">
              <button onClick={() => logout()} className="underline text-muted-foreground">
                Log in with a different account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
