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
import { PlusCircle, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";

export default function MoasPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  const moaQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "memoranda_of_agreement"), orderBy("effectiveDate", "desc"));
  }, [db]);

  const { data: moas, isLoading } = useCollection(moaQuery);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';
  const isStudent = user.role === 'STUDENT';

  const colleges = Array.from(new Set(moas?.map(m => m.college) || []));
  const industries = Array.from(new Set(moas?.map(m => m.industryType) || []));

  const filteredData = useMemo(() => {
    if (!moas) return [];
    return moas.filter(moa => {
      // Role visibility rules
      if (isStudent && moa.status !== 'APPROVED') return false;
      if ((isStudent || isFaculty) && moa.isDeleted) return false;

      // Search matching
      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.companyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.industryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.college.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter matching
      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      const matchesIndustry = industryFilter === "all" || moa.industryType === industryFilter;

      return matchesSearch && matchesCollege && matchesIndustry;
    });
  }, [moas, searchQuery, collegeFilter, industryFilter, isStudent, isFaculty]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">MOA Records</h2>
          <p className="text-muted-foreground">
            Search and manage Memoranda of Agreement.
          </p>
        </div>
        {((isAdmin) || (isFaculty && user.canEdit)) && (
          <AddMoaDialog>
            <Button className="bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New MOA
            </Button>
          </AddMoaDialog>
        )}
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <SearchSection onSearch={setSearchQuery} />
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>College</Label>
            <Select value={collegeFilter} onValueChange={setCollegeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(collegeFilter !== "all" || industryFilter !== "all" || searchQuery !== "") && (
            <Button variant="ghost" onClick={() => {
              setCollegeFilter("all");
              setIndustryFilter("all");
              setSearchQuery("");
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <MoaTable 
          data={filteredData as any} 
          role={user.role} 
          canEdit={user.canEdit}
        />
      )}
    </div>
  );
}
