"use client";

import { useAuth } from "@/lib/auth-context";
import { MoaStats } from "@/components/moa/moa-stats";
import { MOCK_MOAS } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Users, History } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';
  const isStudent = user.role === 'STUDENT';

  // Statistics for different roles
  const filteredMoas = MOCK_MOAS.filter(moa => {
    if (isStudent) return moa.status === 'APPROVED' && !moa.isDeleted;
    if (isFaculty) return !moa.isDeleted;
    return true; // Admin sees all
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h2>
        <p className="text-muted-foreground">
          Here's an overview of the MOA monitoring system.
        </p>
      </div>

      {!isStudent && <MoaStats moas={filteredMoas} />}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {filteredMoas.slice(0, 4).map((moa) => (
                <div key={moa.id} className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{moa.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {moa.college} • {moa.status}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {moa.effectiveDate}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="link" 
              className="mt-6 w-full text-primary" 
              onClick={() => router.push('/dashboard/moas')}
            >
              View all records
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {((isAdmin) || (isFaculty && user.canEdit)) && (
              <Button className="w-full justify-start bg-primary" onClick={() => router.push('/dashboard/moas')}>
                <PlusCircle className="mr-2 h-4 w-4" /> New MOA Entry
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/moas')}>
              <FileText className="mr-2 h-4 w-4" /> Search MOAs
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/users')}>
                  <Users className="mr-2 h-4 w-4" /> Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/audit')}>
                  <History className="mr-2 h-4 w-4" /> Review Audit Logs
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}