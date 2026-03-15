
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  ShieldAlert, 
  Database, 
  Bell, 
  Save,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { InstitutionalSecuritySettings } from "@/lib/mock-data";
import { clearSeededMoas, seedMoasAcrossColleges } from "@/lib/seed-moa-data";

const DEFAULT_SECURITY_SETTINGS: InstitutionalSecuritySettings = {
  maintenanceMode: false,
  auditLoggingEnabled: true,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [draftSecurity, setDraftSecurity] = useState<InstitutionalSecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [showAuditDisableConfirm, setShowAuditDisableConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showClearSeedConfirm, setShowClearSeedConfirm] = useState(false);
  const [seedPerCollege, setSeedPerCollege] = useState("2");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearingSeeded, setIsClearingSeeded] = useState(false);

  const securityDocRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "system_config", "institutional_security");
  }, [db]);

  const { data: securityDoc, isLoading: isSecurityLoading } = useDoc<InstitutionalSecuritySettings>(securityDocRef);

  const persistedSecurity: InstitutionalSecuritySettings = {
    maintenanceMode: securityDoc?.maintenanceMode ?? DEFAULT_SECURITY_SETTINGS.maintenanceMode,
    auditLoggingEnabled: securityDoc?.auditLoggingEnabled ?? DEFAULT_SECURITY_SETTINGS.auditLoggingEnabled,
  };

  const isSecurityDirty =
    draftSecurity.maintenanceMode !== persistedSecurity.maintenanceMode ||
    draftSecurity.auditLoggingEnabled !== persistedSecurity.auditLoggingEnabled;

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (isSecurityLoading) {
      return;
    }

    setDraftSecurity(persistedSecurity);
    setHasHydratedDraft(true);
  }, [isSecurityLoading, persistedSecurity.maintenanceMode, persistedSecurity.auditLoggingEnabled]);

  const handleSaveSecuritySettings = () => {
    if (!db || !securityDocRef || !user) return;

    setDocumentNonBlocking(
      securityDocRef,
      {
        ...draftSecurity,
        updatedAt: serverTimestamp(),
        updatedBy: user.email,
      },
      { merge: true }
    );

    toast({
      title: "Institutional Security Updated",
      description: "Control Panel security settings have been saved.",
    });
  };

  const handleAuditLoggingChange = (checked: boolean) => {
    if (!checked && draftSecurity.auditLoggingEnabled) {
      setShowAuditDisableConfirm(true);
      return;
    }

    setDraftSecurity((prev) => ({
      ...prev,
      auditLoggingEnabled: checked,
    }));
  };

  const handleSeedMoas = async () => {
    if (!db || !user) return;

    const parsedPerCollege = Number(seedPerCollege);
    if (!Number.isFinite(parsedPerCollege) || parsedPerCollege < 1 || parsedPerCollege > 25) {
      toast({
        variant: "destructive",
        title: "Invalid Seed Count",
        description: "Set records per college to a whole number between 1 and 25.",
      });
      return;
    }

    setIsSeeding(true);
    try {
      const result = await seedMoasAcrossColleges({
        db,
        perCollege: parsedPerCollege,
        actor: {
          id: user.id,
          name: user.name,
        },
      });

      toast({
        title: "Seed Complete",
        description: `Inserted ${result.inserted} MOAs across ${result.colleges} colleges.`,
      });
      setShowSeedConfirm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Seed Failed",
        description: "Unable to seed MOA records. Please try again.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearSeededMoas = async () => {
    if (!db || !user) return;

    setIsClearingSeeded(true);
    try {
      const result = await clearSeededMoas({
        db,
        actor: {
          id: user.id,
          name: user.name,
        },
      });

      toast({
        title: "Seeded Records Cleared",
        description: `Deleted ${result.deleted} seeded MOAs (scanned ${result.scanned} total records).`,
      });
      setShowClearSeedConfirm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Clear Seeded Data Failed",
        description: "Unable to clear seeded MOA records. Please try again.",
      });
    } finally {
      setIsClearingSeeded(false);
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <>
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
                <Switch
                  checked={draftSecurity.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setDraftSecurity((prev) => ({
                      ...prev,
                      maintenanceMode: checked,
                    }))
                  }
                  disabled={!hasHydratedDraft}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Mandatory recording of all registry mutations.</p>
                </div>
                <Switch
                  checked={draftSecurity.auditLoggingEnabled}
                  onCheckedChange={handleAuditLoggingChange}
                  disabled={!hasHydratedDraft}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="font-bold"
                  onClick={handleSaveSecuritySettings}
                  disabled={!hasHydratedDraft || isSecurityLoading || !isSecurityDirty}
                >
                  <Save className="h-4 w-4 mr-2" /> Save Institutional Security
                </Button>
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

              <div className="space-y-3">
                <Label className="font-bold">Development Seeder</Label>
                <p className="text-sm text-muted-foreground">
                  Generate synthetic MOA records across all colleges for distribution testing.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    value={seedPerCollege}
                    onChange={(event) => setSeedPerCollege(event.target.value)}
                    className="max-w-[140px]"
                    disabled={isSeeding || isClearingSeeded}
                  />
                  <Button
                    variant="outline"
                    className="font-bold"
                    onClick={() => setShowSeedConfirm(true)}
                    disabled={isSeeding || isClearingSeeded}
                  >
                    {isSeeding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Seeding...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Seed Multi-College MOAs
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="font-bold"
                    onClick={() => setShowClearSeedConfirm(true)}
                    disabled={isSeeding || isClearingSeeded}
                  >
                    {isClearingSeeded ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      "Clear Seeded MOAs"
                    )}
                  </Button>
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

      <AlertDialog open={showAuditDisableConfirm} onOpenChange={setShowAuditDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Audit Logging?</AlertDialogTitle>
            <AlertDialogDescription>
              Disabling this setting stops mandatory registry mutation traceability. Continue only if you explicitly intend to suspend audit capture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDraftSecurity((prev) => ({
                  ...prev,
                  auditLoggingEnabled: false,
                }));
              }}
            >
              Disable Logging
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSeedConfirm} onOpenChange={setShowSeedConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seed MOA Data Across Colleges?</AlertDialogTitle>
            <AlertDialogDescription>
              This will insert generated MOA documents into the live Firestore collection for every college. Use this only for development and demo preparation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSeeding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedMoas} disabled={isSeeding}>
              {isSeeding ? "Seeding..." : "Proceed with Seeding"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearSeedConfirm} onOpenChange={setShowClearSeedConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Seeded MOA Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes records whose HTE ID contains the seeded marker. Use this only to clean up development demo data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingSeeded}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearSeededMoas} disabled={isClearingSeeded}>
              {isClearingSeeded ? "Clearing..." : "Delete Seeded Records"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
