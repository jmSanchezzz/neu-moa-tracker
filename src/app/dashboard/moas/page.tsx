
"use client";

import { useState, useMemo } from "react";
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
import { PlusCircle, Loader2, CalendarClock } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, Timestamp } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";

export default function MoasPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [showOnlyExpiring, setShowOnlyExpiring] = useState(false);

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
  
  const colleges = Array.from(new Set(moas?.map(m => m.college) || []));

  const filteredData = useMemo(() => {
    if (!moas) return [];
    return moas.filter(moa => {
      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.hteId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      return matchesSearch && matchesCollege;
    });
  }, [moas, searchQuery, collegeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">MOA Records</h2>
          <p className="text-muted-foreground">Search and manage institutional agreements.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showOnlyExpiring ? "default" : "outline"} 
            className={showOnlyExpiring ? "bg-amber-600 hover:bg-amber-700" : ""}
            onClick={() => setShowOnlyExpiring(!showOnlyExpiring)}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            {showOnlyExpiring ? "Showing Expiring" : "View Expiring (60 Days)"}
          </Button>
          {(isAdmin || (isFaculty && user.canEdit)) && (
            <AddMoaDialog>
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <MoaTable data={filteredData as any} role={user.role} canEdit={user.canEdit} />
      )}
    </div>
  );
}
