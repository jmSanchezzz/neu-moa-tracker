"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOA } from "@/lib/mock-data";
import { Building2, Mail, User, Briefcase, Calendar, GraduationCap, MapPin, Clock, Archive } from "lucide-react";

type ViewMoaDialogProps = {
  moa: MOA | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViewMoaDialog({ moa, open, onOpenChange }: ViewMoaDialogProps) {
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

  const formatSubStatus = (sub: string | undefined | null) => {
    if (!sub) return "Pending";
    return sub.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: any) => {
    if (!date) return "\u2014";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return isNaN(d.getTime()) ? "\u2014" : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return "\u2014";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => {
        e.preventDefault();
        document.body.style.pointerEvents = '';
      }}>
        {moa && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-2xl font-bold text-slate-900">MOA Details</DialogTitle>
                <div className="flex items-center gap-2">
                  {moa.isDeleted && <Badge className="bg-slate-200 text-slate-600 border-slate-300"><Archive className="h-3 w-3 mr-1" />Archived</Badge>}
                  {getStatusBadge(moa.primaryStatus)}
                </div>
              </div>
              <DialogDescription className="font-mono text-xs uppercase tracking-tighter">
                Reference ID: {moa.hteId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Partner Entity</h4>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-1" />
                  <div>
                    <p className="font-bold text-slate-900 text-lg leading-tight">{moa.companyName}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{moa.companyAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status &amp; Stage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Status</p>
                    <span className="text-sm font-semibold text-slate-700">{moa.primaryStatus}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sub-Status / Stage</p>
                    <span className="text-sm font-semibold text-slate-700">{formatSubStatus(moa.subStatus)}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Industry Segment</h4>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{moa.industryType}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Endorsing College</h4>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{moa.college}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Effective Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{moa.effectiveDate}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expiration Date</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{formatDate(moa.expirationDate)}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Contact</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{moa.contactPerson}</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        <span>{moa.contactPersonEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
