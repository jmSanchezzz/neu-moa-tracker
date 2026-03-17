"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/mock-data";

const userFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.enum(["ADMIN", "FACULTY", "STUDENT"]),
  canEdit: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type EditUserDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      role: "STUDENT",
      canEdit: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        role: user.role,
        canEdit: user.canEdit,
      });
    }
  }, [user, form]);

  async function onSubmit(values: UserFormValues) {
    if (!user || !db) return;
    
    try {
      if (values.role !== user.role && (values.role === "ADMIN" || user.role === "ADMIN")) {
        toast({
          variant: "destructive",
          title: "Admin Role Is Server-Managed",
          description: "Use the secure admin bootstrap flow to grant or revoke admin access.",
        });
        return;
      }

      const docRef = doc(db, "users", user.id);
      updateDocumentNonBlocking(docRef, values);

      toast({
        title: "Profile Updated",
        description: `${values.name}'s permissions have been synchronized.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user profile.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Modify User Access</DialogTitle>
          <DialogDescription>
            Update role and permissions for {user?.email}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">System Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="ADMIN" disabled>System Administrator (Server Managed)</SelectItem>
                      <SelectItem value="FACULTY">Faculty Member</SelectItem>
                      <SelectItem value="STUDENT">Student Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] leading-tight mt-1">
                      Admin elevation is restricted to the secure bootstrap process. Faculty can be granted edit rights. Students are read-only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canEdit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-slate-50/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold text-slate-900">Elevated Edit Rights</FormLabel>
                    <FormDescription className="text-xs">
                      Allow this user to create and modify MOA records.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.watch("role") === "ADMIN"}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-accent font-bold hover:bg-primary/90">
                Save Permissions
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}