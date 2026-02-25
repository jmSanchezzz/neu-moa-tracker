
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
import { PlusCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const moaFormSchema = z.object({
  hteId: z.string().min(2),
  companyName: z.string().min(2),
  companyAddress: z.string().min(5),
  contactPerson: z.string().min(2),
  contactPersonEmail: z.string().email(),
  industryType: z.string().min(2),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
  college: z.string().min(1),
  primaryStatus: z.enum(["PROCESSING", "APPROVED", "EXPIRED"]),
  subStatus: z.string(),
});

type MoaFormValues = z.infer<typeof moaFormSchema>;

export function AddMoaDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
      college: "",
      primaryStatus: "PROCESSING",
      subStatus: "AWAITING_HTE_SIGNATURE",
    },
  });

  const pStatus = form.watch("primaryStatus");

  async function onSubmit(values: MoaFormValues) {
    try {
      const colRef = collection(db, "memoranda_of_agreement");
      addDocumentNonBlocking(colRef, {
        ...values,
        expirationDate: Timestamp.fromDate(new Date(values.expirationDate)),
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });
      
      toast({ title: "Record Created", description: "The institutional agreement has been registered." });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create record." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Create Record</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">New Institutional Agreement</DialogTitle>
          <DialogDescription>Register a new Memorandum of Agreement into the NEU registry.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="primaryStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Primary Status</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val);
                    if (val === 'PROCESSING') form.setValue('subStatus', 'AWAITING_HTE_SIGNATURE');
                    if (val === 'APPROVED') form.setValue('subStatus', 'SIGNED_BY_PRESIDENT');
                    if (val === 'EXPIRED') form.setValue('subStatus', 'NO_RENEWAL_DONE');
                  }} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="subStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Stage / Detail</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {pStatus === 'PROCESSING' && (
                        <>
                          <SelectItem value="AWAITING_HTE_SIGNATURE">Awaiting HTE Signature</SelectItem>
                          <SelectItem value="LEGAL_REVIEW">Legal Review</SelectItem>
                          <SelectItem value="VPAA_APPROVAL">VPAA Approval</SelectItem>
                        </>
                      )}
                      {pStatus === 'APPROVED' && (
                        <>
                          <SelectItem value="SIGNED_BY_PRESIDENT">Signed by President</SelectItem>
                          <SelectItem value="ONGOING_NOTARIZATION">Ongoing Notarization</SelectItem>
                          <SelectItem value="NO_NOTARIZATION_NEEDED">No Notarization Needed</SelectItem>
                        </>
                      )}
                      {pStatus === 'EXPIRED' && (
                        <SelectItem value="NO_RENEWAL_DONE">No Renewal Done</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Company Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="hteId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">HTE ID</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="industryType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Industry</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Effective Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="expirationDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Expiration Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="college" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Endorsing College</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="College of Computer Studies">College of Computer Studies</SelectItem>
                    <SelectItem value="College of Engineering">College of Engineering</SelectItem>
                    <SelectItem value="College of Business Administration">College of Business Administration</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-accent font-bold">Register MOA</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
