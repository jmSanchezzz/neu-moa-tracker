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
import { MoreVertical, Edit, Trash, RotateCcw, Eye } from "lucide-react";
import { EditMoaDialog } from "./edit-moa-dialog";
import { ViewMoaDialog } from "./view-moa-dialog";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

type MoaTableProps = {
  data: MOA[];
  role: UserRole;
  canEdit?: boolean;
};

export function MoaTable({ data, role, canEdit }: MoaTableProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const [viewingMoa, setViewingMoa] = useState<MOA | null>(null);

  const isAdmin = role === 'ADMIN';
  const isFaculty = role === 'FACULTY';
  const isStudent = role === 'STUDENT';

  const handleSoftDelete = (moa: MOA) => {
    if (!db) return;
    const docRef = doc(db, "memoranda_of_agreement", moa.id);
    updateDocumentNonBlocking(docRef, { isDeleted: true });
    toast({
      title: "Record Archived",
      description: `${moa.companyName} has been moved to trash.`,
    });
  };

  const handleRecover = (moa: MOA) => {
    if (!db) return;
    const docRef = doc(db, "memoranda_of_agreement", moa.id);
    updateDocumentNonBlocking(docRef, { isDeleted: false });
    toast({
      title: "Record Restored",
      description: `${moa.companyName} is now active again.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'EXPIRING':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Expiring</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {!isStudent && <TableHead>HTE ID</TableHead>}
            <TableHead>Company Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            {!isStudent && (
              <>
                <TableHead>Industry</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Deleted</TableHead>}
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
                <TableCell className="max-w-[200px] truncate">{moa.companyAddress}</TableCell>
                <TableCell>{moa.contactPerson}</TableCell>
                <TableCell>{moa.contactPersonEmail}</TableCell>
                {!isStudent && (
                  <>
                    <TableCell>{moa.industryType}</TableCell>
                    <TableCell>{moa.college}</TableCell>
                    <TableCell>{moa.effectiveDate}</TableCell>
                    <TableCell>{getStatusBadge(moa.status)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {moa.isDeleted ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100">No</Badge>
                        )}
                      </TableCell>
                    )}
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

                          {isAdmin && moa.isDeleted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleRecover(moa)}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Recover
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
