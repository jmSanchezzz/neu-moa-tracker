
"use client";

import { useEffect } from "react";
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
  Save
} from "lucide-react";
import { useFirestore } from "@/firebase";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const db = useFirestore();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

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
