"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserPlus, UserX, Loader2, Edit2, ShieldCheck, User as UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, setDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole } from "@/lib/mock-data";
import { EditUserDialog } from "@/components/users/edit-user-dialog";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"));
  }, [db]);

  const { data: users, isLoading } = useCollection(usersQuery);

  if (!currentUser || currentUser.role !== 'ADMIN') return null;

  const handleToggleBlock = (user: User) => {
    if (!db) return;
    const docRef = doc(db, "users", user.id);
    const newStatus = !user.isBlocked;
    updateDocumentNonBlocking(docRef, { isBlocked: newStatus });
    toast({
      title: newStatus ? "User Blocked" : "User Restored",
      description: `${user.name} access has been ${newStatus ? 'revoked' : 'granted'}.`,
    });
  };

  const handleToggleEditRights = (user: User) => {
    if (!db) return;
    const docRef = doc(db, "users", user.id);
    const newRights = !user.canEdit;
    updateDocumentNonBlocking(docRef, { canEdit: newRights });
    toast({
      title: "Permissions Updated",
      description: `${user.name} edit rights are now ${newRights ? 'active' : 'disabled'}.`,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Badge className="bg-primary text-white border-primary">ADMIN</Badge>;
      case 'FACULTY': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">FACULTY</Badge>;
      case 'STUDENT': return <Badge variant="outline" className="border-slate-200 text-slate-500">STUDENT</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">IAM Management</h2>
          <p className="text-slate-500 mt-1 font-medium">
            Identity and Access Management control center for system users.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="hover:bg-transparent border-primary">
                <TableHead className="text-white font-bold py-5">Institutional User</TableHead>
                <TableHead className="text-white font-bold">System Role</TableHead>
                <TableHead className="text-white font-bold">Access Status</TableHead>
                <TableHead className="text-white font-bold">Elevated Edit Rights</TableHead>
                <TableHead className="text-right text-white font-bold pr-6">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors border-slate-100">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-full">
                        <UserIcon className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(u.role)}
                  </TableCell>
                  <TableCell>
                    {u.isBlocked ? (
                      <Badge variant="destructive" className="font-bold">Blocked</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={u.canEdit} 
                        disabled={u.role === 'ADMIN' || u.id === currentUser.id} 
                        onCheckedChange={() => handleToggleEditRights(u as any)}
                      />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {u.canEdit ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-bold text-primary hover:bg-primary/10"
                        onClick={() => setEditingUser(u as any)}
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                      </Button>
                      {u.isBlocked ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-bold text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleToggleBlock(u as any)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Unblock
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-bold text-destructive border-destructive/20 hover:bg-red-50"
                          disabled={u.id === currentUser.id}
                          onClick={() => handleToggleBlock(u as any)}
                        >
                          <UserX className="h-3.5 w-3.5 mr-1.5" /> Block
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EditUserDialog 
        user={editingUser} 
        open={!!editingUser} 
        onOpenChange={(open) => !open && setEditingUser(null)} 
      />
    </div>
  );
}