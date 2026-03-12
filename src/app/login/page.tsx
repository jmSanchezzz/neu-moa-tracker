"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Loader2, ArrowRight, FlaskConical } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginAsPrototype, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [prototypeLoading, setPrototypeLoading] = useState<'ADMIN' | 'FACULTY' | 'STUDENT' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePrototypeSignIn = async (role: 'ADMIN' | 'FACULTY' | 'STUDENT') => {
    setPrototypeLoading(role);
    try {
      await loginAsPrototype(role);
    } finally {
      setPrototypeLoading(null);
    }
  };

  const busy = isLoggingIn || isLoading || prototypeLoading !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-accent bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transform rotate-3 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black font-headline text-primary uppercase tracking-tighter">
            NEU MOA TRACKER
          </CardTitle>
          <CardDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1"> 
            Institutional Access Gateway 
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-center border border-slate-100 font-medium text-slate-600 leading-relaxed">
            Authorized Personnel: Sign in with your <b className="text-primary">@neu.edu.ph</b> Google account to access the institutional registry.
          </div>

          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-base font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
            disabled={busy}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                CONNECTING TO GOOGLE...
              </>
            ) : (
              <span className="flex items-center gap-2">
                SIGN IN WITH GOOGLE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <FlaskConical className="w-3 h-3" /> Prototype Access
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['ADMIN', 'FACULTY', 'STUDENT'] as const).map((role) => {
              const styles = {
                ADMIN:   'border-blue-300  text-blue-700  hover:bg-blue-50',
                FACULTY: 'border-amber-300 text-amber-700 hover:bg-amber-50',
                STUDENT: 'border-slate-300 text-slate-600 hover:bg-slate-50',
              }[role];
              return (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrototypeSignIn(role)}
                  disabled={busy}
                  className={`h-10 text-[11px] font-black uppercase tracking-wide border ${styles} transition-colors`}
                >
                  {prototypeLoading === role ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    role
                  )}
                </Button>
              );
            })}
          </div>
          <p className="text-center text-[9px] text-slate-400 font-medium -mt-1">
            Prototype accounts are for testing only and do not require a Google account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black pb-8 opacity-40">
          <p>Official Academic Enterprise System</p>
          <p className="mt-1">Restricted Access • Monitoring Enabled</p>
        </CardFooter>
      </Card>
    </div>
  );
}