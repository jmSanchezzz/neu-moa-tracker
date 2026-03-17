
"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MoaTable } from "@/components/moa/moa-table";
import { SearchSection } from "@/components/moa/search-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, CalendarClock, Archive } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, Timestamp } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";
import { NEU_COLLEGES } from "@/lib/mock-data";

export default function MoasPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const isArchiveView = searchParams.get('filter') === 'deleted';
  const statusParam = searchParams.get('status');
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(
    statusParam && statusParam !== 'EXPIRING' ? statusParam : 'all'
  );
  const [showOnlyExpiring, setShowOnlyExpiring] = useState(statusParam === 'EXPIRING');

  // Time-based Expiring Query Logic for Deliverable
  const expiringQuery = useMemoFirebase(() => {
    if (!db || !showOnlyExpiring) return null;
    const now = new Date();
    const in60Days = new Date();
    in60Days.setDate(now.getDate() + 60);

    return query(
      collection(db, "memoranda_of_agreement"),
      where("primaryStatus", "==", "APPROVED"),
      where("expirationDate", ">=", Timestamp.fromDate(now)),
      where("expirationDate", "<=", Timestamp.fromDate(in60Days)),
      orderBy("expirationDate", "asc")
    );
  }, [db, showOnlyExpiring]);

  // Standard Query
  const standardQuery = useMemoFirebase(() => {
    if (!db || showOnlyExpiring) return null;
    return query(collection(db, "memoranda_of_agreement"), orderBy("effectiveDate", "desc"));
  }, [db, showOnlyExpiring]);

  const activeQuery = showOnlyExpiring ? expiringQuery : standardQuery;
  const { data: moas, isLoading } = useCollection(activeQuery);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';
  
  const colleges = NEU_COLLEGES;
  const industries = Array.from(new Set((moas || []).map((moa) => moa.industryType).filter(Boolean)));

  const isStudent = user.role === 'STUDENT';

  const filteredData = useMemo(() => {
    if (!moas) return [];
    return moas.filter(moa => {
      if (isStudent && moa.primaryStatus !== 'APPROVED') return false;

      // Archive view: only deleted; Normal view: exclude deleted
      if (isArchiveView) {
        if (!moa.isDeleted) return false;
      } else {
        if (moa.isDeleted) return false;
      }

      // Status filter from dropdown
      if (statusFilter !== 'all' && moa.primaryStatus !== statusFilter) return false;

      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.hteId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      const matchesIndustry = industryFilter === "all" || moa.industryType === industryFilter;
      return matchesSearch && matchesCollege && matchesIndustry;
    });
  }, [moas, searchQuery, collegeFilter, industryFilter, statusFilter, isStudent, isArchiveView]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            {isArchiveView ? (
              <span className="flex items-center gap-2"><Archive className="h-7 w-7" /> Archived / Trash</span>
            ) : "MOA Records"}
          </h2>
          <p className="text-muted-foreground">
            {isArchiveView ? "Archived records that have been soft-deleted." : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {!isStudent && !isArchiveView && (
            <Button 
              variant={showOnlyExpiring ? "default" : "outline"} 
              className={showOnlyExpiring ? "bg-amber-600 hover:bg-amber-700" : ""}
              onClick={() => setShowOnlyExpiring(!showOnlyExpiring)}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              {showOnlyExpiring ? "Showing Expiring" : "View Expiring (60 Days)"}
            </Button>
          )}
          {!isArchiveView && (isAdmin || (isFaculty && user.canEdit)) && (
            <AddMoaDialog industryOptions={industries}>
              <Button className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Add New MOA</Button>
            </AddMoaDialog>
          )}
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <SearchSection onSearch={setSearchQuery} />
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Filter by College</Label>
            <Select value={collegeFilter} onValueChange={setCollegeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Colleges" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filter by Industry</Label>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Industries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isStudent && (
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <MoaTable data={filteredData as any} role={user.role} canEdit={user.canEdit} industryOptions={industries} />
      )}
    </div>
  );
}
