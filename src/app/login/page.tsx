
"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { loginWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.endsWith('@neu.edu.ph')) return;
    
    setIsLoggingIn(true);
    try {
      await loginWithEmail(email);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-accent bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-sidebar/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transform rotate-3 shadow-inner">
            <ShieldCheck className="w-12 h-12 text-sidebar" />
          </div>
          <CardTitle className="text-3xl font-black font-headline text-sidebar uppercase tracking-tighter">
            NEU MOA TRACKER
          </CardTitle>
          <CardDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mt-1"> 
            Institutional Access Gateway 
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-center border border-slate-100 font-medium text-slate-600 leading-relaxed">
            Authorized Personnel: Please enter your <b className="text-sidebar">@neu.edu.ph</b> email to access the administrative command center.
          </div>
          
          <form onSubmit={handleManualSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="identity@neu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-sidebar font-semibold"
                required
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground h-14 text-base font-black shadow-lg shadow-sidebar/20 transition-all active:scale-[0.98] group"
              disabled={isLoggingIn || isLoading || !email.endsWith('@neu.edu.ph')}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  ENTER COMMAND CENTER <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black pb-8 opacity-40">
          <p>Official Academic Enterprise System</p>
          <p className="mt-1">Restricted Access • Monitoring Enabled</p>
        </CardFooter>
      </Card>
    </div>
  );
}
