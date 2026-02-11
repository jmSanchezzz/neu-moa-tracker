"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { MoaStats } from "@/components/moa/moa-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Edit, 
  Trash2, 
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  PlusCircle
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real-time Firestore Collection
  const moaQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "memoranda_of_agreement"),
      orderBy("effectiveDate", "desc")
    );
  }, [db]);

  const { data: moas, isLoading } = useCollection(moaQuery);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';
  const isStudent = user.role === 'STUDENT';

  const colleges = Array.from(new Set(moas?.map(m => m.college) || []));
  const industries = Array.from(new Set(moas?.map(m => m.industryType) || []));

  const filteredMoas = useMemo(() => {
    if (!moas) return [];
    return moas.filter(moa => {
      if (isStudent && moa.status !== 'APPROVED') return false;
      if ((isStudent || isFaculty) && moa.isDeleted) return false;

      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.hteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      const matchesIndustry = industryFilter === "all" || moa.industryType === industryFilter;
      const matchesStatus = statusFilter === "all" || moa.status === statusFilter;

      return matchesSearch && matchesCollege && matchesIndustry && matchesStatus;
    });
  }, [moas, searchQuery, collegeFilter, industryFilter, statusFilter, isStudent, isFaculty]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': 
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-3 py-1 font-semibold rounded-full">Approved</Badge>;
      case 'PROCESSING': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1 font-semibold rounded-full">Processing</Badge>;
      case 'EXPIRING': 
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 px-3 py-1 font-semibold rounded-full flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Expiring
          </Badge>
        );
      case 'EXPIRED': 
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 px-3 py-1 font-semibold rounded-full">Expired</Badge>;
      default: 
        return <Badge variant="outline" className="px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Command Center</h2>
          <p className="text-slate-500 mt-1 font-medium">
            Real-time institutional agreement monitoring and analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-300 font-semibold shadow-sm">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-slate-600" /> Export CSV
          </Button>
          {(isAdmin || (isFaculty && user.canEdit)) && (
            <AddMoaDialog>
              <Button className="bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all font-semibold">
                <PlusCircle className="mr-2 h-4 w-4 text-amber-500" /> Create Record
              </Button>
            </AddMoaDialog>
          )}
        </div>
      </div>

      <MoaStats moas={filteredMoas as any} />

      <Card className="border-none shadow-sm bg-slate-50 ring-1 ring-slate-200">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Company, HTE, or ID..." 
              className="pl-10 bg-white border-slate-200 focus-visible:ring-amber-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="w-[160px] bg-white border-slate-200 font-medium">
                  <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200 font-medium">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="EXPIRING">Expiring</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 bg-white border-slate-200 font-medium">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <span>Date Range</span>
            </Button>

            {(searchQuery || collegeFilter !== "all" || industryFilter !== "all" || statusFilter !== "all") && (
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900" onClick={() => {
                setSearchQuery("");
                setCollegeFilter("all");
                setIndustryFilter("all");
                setStatusFilter("all");
              }}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-xl rounded-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-900 text-white hover:bg-slate-900">
                <TableRow className="hover:bg-transparent border-slate-800">
                  <TableHead className="w-[320px] text-slate-200 font-bold py-5">Company Entity</TableHead>
                  <TableHead className="text-slate-200 font-bold">Industry Segment</TableHead>
                  <TableHead className="text-slate-200 font-bold">Primary Contact</TableHead>
                  <TableHead className="text-slate-200 font-bold">Effective Date</TableHead>
                  <TableHead className="text-slate-200 font-bold">College</TableHead>
                  <TableHead className="text-slate-200 font-bold">Status</TableHead>
                  <TableHead className="text-right text-slate-200 font-bold pr-6">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredMoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-slate-400 font-medium">
                      No matching records found in institutional database. Use "Create Record" to add your first MOA.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMoas.map((moa) => (
                    <TableRow key={moa.id} className="hover:bg-slate-50 transition-colors border-slate-100 group">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 text-base leading-none">{moa.companyName}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{moa.hteId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 bg-slate-100/50">
                          {moa.industryType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{moa.contactPerson}</span>
                          <span className="text-xs text-slate-500 font-medium">{moa.contactPersonEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-bold">
                        {moa.effectiveDate}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 font-medium">
                        {moa.college}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(moa.status)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Displaying {filteredMoas.length} of {moas?.length || 0} Total Institutional Records
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="text-xs font-bold border-slate-300">Previous</Button>
            <Button variant="outline" size="sm" disabled className="text-xs font-bold border-slate-300">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
