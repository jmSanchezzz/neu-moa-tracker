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
import { PlusCircle, Loader2 } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

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
      college: "",
      status: "PROCESSING",
    },
  });

  async function onSubmit(values: MoaFormValues) {
    try {
      const colRef = collection(db, "memoranda_of_agreement");
      addDocumentNonBlocking(colRef, {
        ...values,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Record Queued",
        description: `${values.companyName} MOA is being added to the registry.`,
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate record creation.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all font-semibold">
            <PlusCircle className="mr-2 h-4 w-4 text-accent" /> Create Record
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">New Institutional Agreement</DialogTitle>
          <DialogDescription>
            Register a new Memorandum of Agreement into the NEU registry.
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
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Initial Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-accent font-bold hover:bg-primary/90">
                Register MOA Record
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}