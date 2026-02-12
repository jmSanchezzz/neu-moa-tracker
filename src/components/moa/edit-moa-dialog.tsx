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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { MOA } from "@/lib/mock-data";

const moaFormSchema = z.object({
  hteId: z.string().min(2, "HTE ID is required"),
  companyName: z.string().min(2, "Company Name is required"),
  companyAddress: z.string().min(5, "Full address is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  contactPersonEmail: z.string().email("Invalid email address"),
  industryType: z.string().min(2, "Industry type is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  college: z.string().min(1, "College endorsement is required"),
  status: z.enum(["APPROVED", "PROCESSING", "EXPIRING", "EXPIRED"]),
});

type MoaFormValues = z.infer<typeof moaFormSchema>;

type EditMoaDialogProps = {
  moa: MOA | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditMoaDialog({ moa, open, onOpenChange }: EditMoaDialogProps) {
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<MoaFormValues>({
    resolver: zodResolver(moaFormSchema),
    defaultValues: {
      hteId: "",
      companyName: "",
      companyAddress: "",
      contactPerson: "",
      contactPersonEmail: "",
      industryType: "",
      effectiveDate: "",
      college: "",
      status: "PROCESSING",
    },
  });

  useEffect(() => {
    if (moa) {
      form.reset({
        hteId: moa.hteId,
        companyName: moa.companyName,
        companyAddress: moa.companyAddress,
        contactPerson: moa.contactPerson,
        contactPersonEmail: moa.contactPersonEmail,
        industryType: moa.industryType,
        effectiveDate: moa.effectiveDate,
        college: moa.college,
        status: moa.status as any,
      });
    }
  }, [moa, form]);

  async function onSubmit(values: MoaFormValues) {
    if (!moa || !db) return;
    
    try {
      const docRef = doc(db, "memoranda_of_agreement", moa.id);
      updateDocumentNonBlocking(docRef, values);
      
      toast({
        title: "Record Updated",
        description: `${values.companyName} MOA has been updated.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update record.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Edit MOA Record</DialogTitle>
          <DialogDescription>
            Modify institutional agreement details for {moa?.companyName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">HTE ID Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="HTE-XXXX-202X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="EXPIRING">Expiring</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Corporate Entity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Legal Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Registered Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Floor, Building, Street, City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Point of Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPersonEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Corporate Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Industry Segment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Telecommunications" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Endorsing College</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="College of Computer Studies">College of Computer Studies</SelectItem>
                        <SelectItem value="College of Engineering">College of Engineering</SelectItem>
                        <SelectItem value="College of Business Administration">College of Business Administration</SelectItem>
                        <SelectItem value="College of Hospitality Management">College of Hospitality Management</SelectItem>
                        <SelectItem value="College of Arts and Sciences">College of Arts and Sciences</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-accent font-bold hover:bg-primary/90">
                Update Record
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}