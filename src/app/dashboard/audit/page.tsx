"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const getOpBadge = (op: string) => {
    switch (op) {
      case 'INSERT': return <Badge className="bg-green-100 text-green-800">INSERT</Badge>;
      case 'EDIT': return <Badge className="bg-blue-100 text-blue-800">EDIT</Badge>;
      case 'DELETE': return <Badge className="bg-red-100 text-red-800">DELETE</Badge>;
      case 'RECOVER': return <Badge className="bg-purple-100 text-purple-800">RECOVER</Badge>;
      default: return <Badge variant="outline">{op}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Audit Trail</h2>
        <p className="text-muted-foreground">
          Track all operations performed by users in the system.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>MOA ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_AUDIT_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.userName}</TableCell>
                <TableCell>{getOpBadge(log.operation)}</TableCell>
                <TableCell className="font-mono text-xs">{log.moaId}</TableCell>
                <TableCell>
                  {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Performed {log.operation.toLowerCase()} on record {log.moaId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}