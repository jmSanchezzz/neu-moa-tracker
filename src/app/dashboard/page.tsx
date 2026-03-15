
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MoaStats } from "@/components/moa/moa-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertCircle,
  Clock3,
  PlusCircle
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";
import { EditMoaDialog } from "@/components/moa/edit-moa-dialog";
import { MoaStatusDistributionChart } from "@/components/moa/moa-status-distribution-chart";
import { MOA } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      router.push('/dashboard/moas');
    }
  }, [user, router]);

  const moaQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "memoranda_of_agreement"),
      orderBy("effectiveDate", "desc")
    );
  }, [db]);

  const { data: moas } = useCollection(moaQuery);

  if (!user || user.role === 'STUDENT') return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';

  const industries = Array.from(new Set(moas?.map(m => m.industryType) || []));

  const isExpiring = (moa: MOA) => {
    if (moa.primaryStatus !== 'APPROVED') return false;
    const expDate = moa.expirationDate?.toDate ? moa.expirationDate.toDate() : new Date(moa.expirationDate);
    const diffDays = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  const expiringMoas = useMemo(() => {
    if (!moas) return [];
    return moas.filter((moa) => isExpiring(moa as MOA)).slice(0, 5);
  }, [moas]);

  const processingMoas = useMemo(() => {
    if (!moas) return [];
    return moas.filter((moa) => moa.primaryStatus === 'PROCESSING').slice(0, 5);
  }, [moas]);

  const formatSubStatus = (sub: string | undefined | null) => {
    if (!sub) return "Pending Stage";
    return sub.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">Admin Command Center</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            
          </p>
        </div>
        <div className="flex gap-3">
          {(isAdmin || (isFaculty && user.canEdit)) && (
            <AddMoaDialog industryOptions={industries}>
              <Button className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all font-semibold">
                <PlusCircle className="mr-2 h-4 w-4 text-accent" /> Create Record
              </Button>
            </AddMoaDialog>
          )}
        </div>
      </div>

      <MoaStats moas={(moas ?? []) as any} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5" /> Critical Expiring
              </CardTitle>
              <CardDescription>Top 5 approved MOAs expiring in the next 60 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Entity</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringMoas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No expiring MOAs in the next 60 days.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringMoas.map((moa) => (
                      <TableRow key={moa.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{moa.companyName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{moa.hteId}</span>
                          </div>
                        </TableCell>
                        <TableCell>{moa.college}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => setEditingMoa(moa as MOA)}>Review</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Clock3 className="h-5 w-5" /> Processing Queue
              </CardTitle>
              <CardDescription>Top 5 MOAs currently in workflow processing stages.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Entity</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingMoas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No MOAs are currently in processing.
                      </TableCell>
                    </TableRow>
                  ) : (
                    processingMoas.map((moa) => (
                      <TableRow key={moa.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{moa.companyName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{moa.hteId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{formatSubStatus(moa.subStatus)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => setEditingMoa(moa as MOA)}>Review</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1 flex">
          <MoaStatusDistributionChart moas={(moas || []) as any} />
        </div>
      </div>

      <EditMoaDialog
        moa={editingMoa}
        open={!!editingMoa}
        onOpenChange={(open) => !open && setEditingMoa(null)}
        industryOptions={industries}
      />
    </div>
  );
}
