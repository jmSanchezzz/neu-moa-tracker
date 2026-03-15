
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { doc, Timestamp, writeBatch, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { MOA, NEU_COLLEGES } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

const moaFormSchema = z.object({
  hteId: z.string().min(2, "HTE ID is required"),
  companyName: z.string().min(2, "Company Name is required"),
  companyAddress: z.string().min(5, "Full address is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  contactPersonEmail: z.string().email("Invalid email address"),
  industryType: z.string().min(2, "Industry type is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  expirationDate: z.string().optional(),
  college: z.string().min(1, "College endorsement is required"),
  primaryStatus: z.enum(["APPROVED", "PROCESSING", "EXPIRED"]),
  subStatus: z.string().min(1, "Stage detail is required"),
});

type MoaFormValues = z.infer<typeof moaFormSchema>;

type EditMoaDialogProps = {
  moa: MOA | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industryOptions?: string[];
};

const OTHER_INDUSTRY_VALUE = "__other__";

export function EditMoaDialog({ moa, open, onOpenChange, industryOptions = [] }: EditMoaDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const db = useFirestore();
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [otherIndustry, setOtherIndustry] = useState("");

  const normalizedIndustryOptions = useMemo(() => {
    return Array.from(new Set(industryOptions.map((industry) => industry.trim()).filter(Boolean)));
  }, [industryOptions]);

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
      expirationDate: "",
      college: "",
      primaryStatus: "PROCESSING",
      subStatus: "AWAITING_HTE_SIGNATURE",
    },
  });

  const pStatus = form.watch("primaryStatus");

  useEffect(() => {
    if (moa) {
      let expDateStr = "";
      if (moa.expirationDate) {
        try {
          const dateObj = moa.expirationDate.toDate 
            ? moa.expirationDate.toDate() 
            : new Date(moa.expirationDate);
          
          if (!isNaN(dateObj.getTime())) {
            expDateStr = dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          expDateStr = "";
        }
      }

      form.reset({
        hteId: moa.hteId || "",
        companyName: moa.companyName || "",
        companyAddress: moa.companyAddress || "",
        contactPerson: moa.contactPerson || "",
        contactPersonEmail: moa.contactPersonEmail || "",
        industryType: moa.industryType || "",
        effectiveDate: moa.effectiveDate || "",
        expirationDate: expDateStr,
        college: moa.college || "",
        primaryStatus: moa.primaryStatus || "PROCESSING",
        subStatus: moa.subStatus || "AWAITING_HTE_SIGNATURE",
      });

      const normalizedMoaIndustry = (moa.industryType || "").trim();
      if (!normalizedMoaIndustry) {
        setSelectedIndustry("");
        setOtherIndustry("");
      } else if (normalizedIndustryOptions.includes(normalizedMoaIndustry)) {
        setSelectedIndustry(normalizedMoaIndustry);
        setOtherIndustry("");
      } else {
        setSelectedIndustry(OTHER_INDUSTRY_VALUE);
        setOtherIndustry(normalizedMoaIndustry);
      }
    }
  }, [moa, form, normalizedIndustryOptions]);

  async function onSubmit(values: MoaFormValues) {
    if (!moa || !db || !user) return;

    const resolvedIndustry = selectedIndustry === OTHER_INDUSTRY_VALUE
      ? otherIndustry.trim()
      : selectedIndustry;

    if (resolvedIndustry.length < 2) {
      form.setError("industryType", { message: "Industry type is required" });
      return;
    }
    
    try {
      const batch = writeBatch(db);
      const docRef = doc(db, "memoranda_of_agreement", moa.id);
      
      let finalExpiration: Date;
      if (values.expirationDate) {
        finalExpiration = new Date(values.expirationDate);
      } else {
        finalExpiration = new Date(values.effectiveDate);
        finalExpiration.setFullYear(finalExpiration.getFullYear() + 2);
      }

      const updateData = {
        ...values,
        industryType: resolvedIndustry,
        expirationDate: Timestamp.fromDate(finalExpiration),
      };
      
      batch.update(docRef, updateData);

      // Create Audit Log
      const logRef = doc(collection(db, "audit_logs"));
      batch.set(logRef, {
        userId: user.id,
        userName: user.name,
        operation: 'EDIT',
        moaId: moa.id,
        timestamp: Timestamp.now(),
        details: `Updated registry details for ${values.companyName}.`
      });
      
      await batch.commit();
      
      toast({
        title: "Record Updated",
        description: "The institutional registry and audit trail have been updated.",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => {
        e.preventDefault();
        document.body.style.pointerEvents = '';
      }}>
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
                name="primaryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Primary Status</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      if (val === 'PROCESSING') form.setValue('subStatus', 'AWAITING_HTE_SIGNATURE');
                      if (val === 'APPROVED') form.setValue('subStatus', 'SIGNED_BY_PRESIDENT');
                      if (val === 'EXPIRED') form.setValue('subStatus', 'NO_RENEWAL_DONE');
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Stage / Detail</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select detail" />
                        </SelectTrigger>
                      </FormControl>
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
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Industry Segment</FormLabel>
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
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
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
                )}
              />
            </div>

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

            <div className="grid grid-cols-3 gap-4">
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
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">College</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NEU_COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
