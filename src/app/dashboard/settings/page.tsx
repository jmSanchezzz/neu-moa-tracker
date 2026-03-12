
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  ShieldAlert, 
  Database, 
  History, 
  Bell, 
  FileLock,
  Loader2,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import { MOCK_MOAS } from "@/lib/mock-data";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const handleSeed = async () => {
    if (!db || isSeeding) return;
    setIsSeeding(true);
    
    try {
      const batch = writeBatch(db);
      MOCK_MOAS.forEach((moa) => {
        const docRef = doc(collection(db, "memoranda_of_agreement"));
        
        // Ensure 2-year validity
        const effDate = new Date(moa.effectiveDate);
        const expDate = new Date(effDate);
        expDate.setFullYear(expDate.getFullYear() + 2);

        batch.set(docRef, { 
          ...moa, 
          id: docRef.id,
          effectiveDate: moa.effectiveDate,
          expirationDate: Timestamp.fromDate(expDate),
          isDeleted: false
        });

        // Log the seeding action
        const logRef = doc(collection(db, "audit_logs"));
        batch.set(logRef, {
          userId: user.id,
          userName: user.name,
          operation: 'INSERT',
          moaId: docRef.id,
          timestamp: Timestamp.now(),
          details: `Seeded ${moa.companyName} via System Control Panel.`
        });
      });
      
      await batch.commit();
      
      toast({
        title: "System Synchronized",
        description: "Institutional records and audit trails have been populated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: "Insufficient permissions to modify institutional registry.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="bg-primary p-2 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary uppercase">System Control Panel</h2>
          <p className="text-muted-foreground font-medium">Configure global institutional registry parameters.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <ShieldAlert className="h-5 w-5" /> Institutional Security
            </CardTitle>
            <CardDescription>Manage global access and system visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Restrict system access to Administrators only.</p>
              </div>
              <Switch disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Mandatory recording of all registry mutations.</p>
              </div>
              <Switch checked disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Database className="h-5 w-5" /> Registry Defaults
            </CardTitle>
            <CardDescription>Configure standard agreement parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">Default Validity Period (Years)</Label>
              <div className="flex gap-2">
                <Input defaultValue="2" type="number" className="max-w-[100px]" />
                <Button variant="outline" className="font-bold">Set Default</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="font-bold">Institutional Data Tools</Label>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSeed} 
                  disabled={isSeeding}
                  className="bg-accent text-accent-foreground font-bold w-full hover:bg-accent/90"
                >
                  {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                  Seed Institutional Records
                </Button>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
                  Populates 20 sample MOAs and audit logs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" /> Notification Engine
            </CardTitle>
            <CardDescription>Manage expiration alerts and system broadcasts.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Expiring Threshold</Label>
              <Input defaultValue="60" type="number" />
              <p className="text-[10px] text-muted-foreground italic">Days before expiration to trigger alerts.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400">Faculty Permissions</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch defaultChecked />
                <span className="text-sm font-bold">Auto-grant edit rights</span>
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary font-bold">
                <Save className="h-4 w-4 mr-2" /> Save System Config
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
