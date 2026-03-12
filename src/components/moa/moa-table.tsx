
"use client";

import { useState } from "react";
import { MOA, UserRole } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, RotateCcw, Eye, AlertCircle } from "lucide-react";
import { EditMoaDialog } from "./edit-moa-dialog";
import { ViewMoaDialog } from "./view-moa-dialog";
import { useFirestore } from "@/firebase";
import { doc, writeBatch, collection, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

type MoaTableProps = {
  data: MOA[];
  role: UserRole;
  canEdit?: boolean;
};

export function MoaTable({ data, role, canEdit }: MoaTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const [viewingMoa, setViewingMoa] = useState<MOA | null>(null);

  const isAdmin = role === 'ADMIN';
  const isFaculty = role === 'FACULTY';
  const isStudent = role === 'STUDENT';

  const handleSoftDelete = async (moa: MOA) => {
    if (!db || !user) return;
    
    try {
      const batch = writeBatch(db);
      const docRef = doc(db, "memoranda_of_agreement", moa.id);
      
      batch.update(docRef, { isDeleted: true });

      // Create Audit Log
      const logRef = doc(collection(db, "audit_logs"));
      batch.set(logRef, {
        userId: user.id,
        userName: user.name,
        operation: 'DELETE',
        moaId: moa.id,
        timestamp: Timestamp.now(),
        details: `Archived institutional record for ${moa.companyName}.`
      });
      
      await batch.commit();
      
      toast({
        title: "Record Archived",
        description: `${moa.companyName} has been moved to trash and audited.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive record.",
      });
    }
  };

  const isExpiring = (moa: MOA) => {
    if (moa.primaryStatus !== 'APPROVED') return false;
    const expDate = moa.expirationDate?.toDate ? moa.expirationDate.toDate() : new Date(moa.expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  const getStatusBadge = (moa: MOA) => {
    const expiring = isExpiring(moa);
    
    if (expiring) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 px-3 py-1 font-semibold rounded-full flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Expiring Soon
        </Badge>
      );
    }

    switch (moa.primaryStatus) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{moa.primaryStatus || "No Status"}</Badge>;
    }
  };

  const formatSubStatus = (sub: string | undefined | null) => {
    if (!sub) return "Pending Stage";
    return sub.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {!isStudent && <TableHead>HTE ID</TableHead>}
            <TableHead>Company Name</TableHead>
            <TableHead>Primary Status</TableHead>
            <TableHead>Stage / Detail</TableHead>
            {!isStudent && (
              <>
                <TableHead>College</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                No MOA records found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((moa) => (
              <TableRow key={moa.id} className={moa.isDeleted ? "opacity-50 grayscale bg-muted/20" : ""}>
                {!isStudent && <TableCell className="font-mono text-xs">{moa.hteId}</TableCell>}
                <TableCell className="font-medium">{moa.companyName}</TableCell>
                <TableCell>{getStatusBadge(moa)}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-500">{formatSubStatus(moa.subStatus)}</span>
                </TableCell>
                {!isStudent && (
                  <>
                    <TableCell>{moa.college}</TableCell>
                    <TableCell className="text-xs">
                      {moa.expirationDate?.toDate ? moa.expirationDate.toDate().toLocaleDateString() : new Date(moa.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingMoa(moa)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          
                          {((isAdmin) || (isFaculty && canEdit)) && !moa.isDeleted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setEditingMoa(moa)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => handleSoftDelete(moa)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Soft Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditMoaDialog 
        moa={editingMoa} 
        open={!!editingMoa} 
        onOpenChange={(open) => !open && setEditingMoa(null)} 
      />
      
      <ViewMoaDialog 
        moa={viewingMoa} 
        open={!!viewingMoa} 
        onOpenChange={(open) => !open && setViewingMoa(null)} 
      />
    </div>
  );
}
