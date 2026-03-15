
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NEU_COLLEGES } from "@/lib/mock-data";
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
import { collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

const moaFormSchema = z.object({
  hteId: z.string().min(2),
  companyName: z.string().min(2),
  companyAddress: z.string().min(5),
  contactPerson: z.string().min(2),
  contactPersonEmail: z.string().email(),
  industryType: z.string().min(2, "Industry is required"),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().optional(),
  college: z.string().min(1),
  primaryStatus: z.enum(["PROCESSING", "APPROVED", "EXPIRED"]),
  subStatus: z.string(),
});

type MoaFormValues = z.infer<typeof moaFormSchema>;

type AddMoaDialogProps = {
  children?: React.ReactNode;
  industryOptions?: string[];
};

const OTHER_INDUSTRY_VALUE = "__other__";

export function AddMoaDialog({ children, industryOptions = [] }: AddMoaDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [otherIndustry, setOtherIndustry] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();

  const normalizedIndustryOptions = useMemo(() => {
    return Array.from(new Set(industryOptions.map((industry) => industry.trim()).filter(Boolean)));
  }, [industryOptions]);

  const today = new Date();
  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(today.getFullYear() + 2);

  const form = useForm<MoaFormValues>({
    resolver: zodResolver(moaFormSchema),
    defaultValues: {
      hteId: "",
      companyName: "",
      companyAddress: "",
      contactPerson: "",
      contactPersonEmail: "",
      industryType: "",
      effectiveDate: today.toISOString().split('T')[0],
      expirationDate: twoYearsLater.toISOString().split('T')[0],
      college: "",
      primaryStatus: "PROCESSING",
      subStatus: "AWAITING_HTE_SIGNATURE",
    },
  });

  const pStatus = form.watch("primaryStatus");

  async function onSubmit(values: MoaFormValues) {
    if (!db || !user) return;

    const resolvedIndustry = selectedIndustry === OTHER_INDUSTRY_VALUE
      ? otherIndustry.trim()
      : selectedIndustry;

    if (resolvedIndustry.length < 2) {
      form.setError("industryType", { message: "Industry is required" });
      return;
    }
    
    try {
      const batch = writeBatch(db);
      const moaRef = doc(collection(db, "memoranda_of_agreement"));
      
      // Default to 2 years if not specified
      let finalExpiration: Date;
      if (values.expirationDate) {
        finalExpiration = new Date(values.expirationDate);
      } else {
        finalExpiration = new Date(values.effectiveDate);
        finalExpiration.setFullYear(finalExpiration.getFullYear() + 2);
      }

      const moaData = {
        ...values,
        industryType: resolvedIndustry,
        id: moaRef.id,
        expirationDate: Timestamp.fromDate(finalExpiration),
        isDeleted: false,
        createdAt: Timestamp.now(),
      };

      batch.set(moaRef, moaData);

      // Create Audit Log
      const logRef = doc(collection(db, "audit_logs"));
      batch.set(logRef, {
        userId: user.id,
        userName: user.name,
        operation: 'INSERT',
        moaId: moaRef.id,
        timestamp: Timestamp.now(),
        details: `Created new institutional agreement for ${values.companyName}.`
      });
      
      await batch.commit();
      
      toast({ title: "Record Created", description: "The institutional agreement has been registered and audited." });
      setOpen(false);
      form.reset();
      setSelectedIndustry("");
      setOtherIndustry("");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create record." });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
          setSelectedIndustry("");
          setOtherIndustry("");
        }
      }}
    >
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
                  <Select
                    value={selectedIndustry}
                    onValueChange={(value) => {
                      setSelectedIndustry(value);
                      if (value === OTHER_INDUSTRY_VALUE) {
                        field.onChange(otherIndustry);
                        return;
                      }
                      setOtherIndustry("");
                      field.onChange(value);
                    }}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {normalizedIndustryOptions.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_INDUSTRY_VALUE}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedIndustry === OTHER_INDUSTRY_VALUE && (
                    <FormControl>
                      <Input
                        placeholder="Enter industry"
                        value={otherIndustry}
                        onChange={(event) => {
                          const value = event.target.value;
                          setOtherIndustry(value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
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
                  <FormLabel className="font-bold text-xs uppercase text-slate-500">Expiration Date (Default 2 Years)</FormLabel>
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
                    {NEU_COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
