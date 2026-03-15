
"use client";

import { useAuth } from "@/lib/auth-context";
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Loader2, History, Database } from "lucide-react";

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const auditQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      limit(100)
    );
  }, [db, isAdmin]);

  const { data: logs, isLoading } = useCollection(auditQuery);

  if (!user || user.role !== 'ADMIN') return null;

  const getOpBadge = (op: string) => {
    switch (op) {
      case 'INSERT': return <Badge className="bg-green-100 text-green-800 border-green-200">INSERT</Badge>;
      case 'EDIT': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">EDIT</Badge>;
      case 'DELETE': return <Badge className="bg-red-100 text-red-800 border-red-200">DELETE</Badge>;
      case 'RECOVER': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">RECOVER</Badge>;
      default: return <Badge variant="outline">{op}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="bg-primary p-2 rounded-lg">
          <History className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary uppercase">System Audit Trails</h2>
          <p className="text-muted-foreground font-medium">
            Verifiable record of all institutional registry operations.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Secure Logs...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="hover:bg-transparent border-primary">
                <TableHead className="text-white font-bold py-5">Personnel</TableHead>
                <TableHead className="text-white font-bold">Operation Type</TableHead>
                <TableHead className="text-white font-bold">Registry Reference</TableHead>
                <TableHead className="text-white font-bold">Timestamp</TableHead>
                <TableHead className="text-white font-bold pr-6">Activity Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50 transition-colors border-slate-100">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.userId.slice(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>{getOpBadge(log.operation)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                        {log.moaId.slice(0, 12)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">
                      {log.timestamp?.toDate 
                        ? format(log.timestamp.toDate(), "MMM d, yyyy • h:mm a")
                        : "Invalid Date"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 font-medium pr-6">
                      {log.details || `Performed institutional ${log.operation.toLowerCase()} on record.`}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-muted p-4 rounded-full">
                        <Database className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-primary font-bold text-lg">No Audit History Found.</p>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                          The institutional audit trail is currently empty. Use the <b>Control Panel</b> to seed sample records.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
