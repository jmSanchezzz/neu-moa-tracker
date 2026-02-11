"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/lib/mock-data";
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
import { ShieldCheck, UserMinus, UserPlus, UserX } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">User Management</h2>
        <p className="text-muted-foreground">
          Manage system users, assign roles, and control access rights.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Edit Rights</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USERS.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{u.role.toLowerCase()}</Badge>
                </TableCell>
                <TableCell>
                  {u.isBlocked ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch checked={u.canEdit} disabled={u.role === 'ADMIN'} />
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  {u.isBlocked ? (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                      <UserPlus className="h-4 w-4 mr-1" /> Unblock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20" disabled={u.id === user.id}>
                      <UserX className="h-4 w-4 mr-1" /> Block
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}