
"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary uppercase tracking-tight">NEU MOA Tracker</CardTitle>
          <CardDescription className="font-semibold text-muted-foreground"> Institutional Access Gateway </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-sm text-center border border-border">
            Please sign in with your <b className="text-primary">@neu.edu.ph</b> account to access the administrative command center.
          </div>
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-bold shadow-md transition-all active:scale-95"
            disabled={isLoggingIn || isLoading}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validating Credentials...
              </>
            ) : (
              "Sign In with Google"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
          <p>Official Academic Enterprise System</p>
          <p className="mt-1">Authorized Personnel Only</p>
        </CardFooter>
      </Card>
    </div>
  );
}
