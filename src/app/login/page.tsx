
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
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline text-primary">NEU MOA Tracker</CardTitle>
          <CardDescription> Institutional Google Login </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-sm text-center">
            Click the button below to sign in with your <b>@neu.edu.ph</b> account.
          </div>
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
            disabled={isLoggingIn || isLoading}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In with Google"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-xs text-muted-foreground">
          <p>This application is for official NEU use only.</p>
          <p className="mt-1">Authorized personnel will be granted access.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
