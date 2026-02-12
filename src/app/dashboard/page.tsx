"use client";

import { useState, useMemo, useEffect } from "react";
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
  PlusCircle,
  Database
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch } from "firebase/firestore";
import { AddMoaDialog } from "@/components/moa/add-moa-dialog";
import { MOCK_MOAS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { EditMoaDialog } from "@/components/moa/edit-moa-dialog";
import { MOA } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);

  // Redirect Students away from the Command Center
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      router.push('/dashboard/moas');
    }
  }, [user, router]);

  const moaQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "memoranda_of_agreement"),
      orderBy("effectiveDate", "desc")
    );
  }, [db]);

  const { data: moas, isLoading } = useCollection(moaQuery);

  if (!user || user.role === 'STUDENT') return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';

  const colleges = Array.from(new Set(moas?.map(m => m.college) || []));
  const industries = Array.from(new Set(moas?.map(m => m.industryType) || []));

  const filteredMoas = useMemo(() => {
    if (!moas) return [];
    return moas.filter(moa => {
      if (user.role === 'STUDENT' && moa.status !== 'APPROVED') return false;
      if ((user.role === 'STUDENT' || isFaculty) && moa.isDeleted) return false;

      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.hteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      const matchesIndustry = industryFilter === "all" || moa.industryType === industryFilter;
      const matchesStatus = statusFilter === "all" || moa.status === statusFilter;

      return matchesSearch && matchesCollege && matchesIndustry && matchesStatus;
    });
  }, [moas, searchQuery, collegeFilter, industryFilter, statusFilter, user.role, isFaculty]);

  const seedDatabase = async () => {
    if (!db || isSeeding) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      MOCK_MOAS.forEach((moa) => {
        const docRef = doc(collection(db, "memoranda_of_agreement"));
        batch.set(docRef, { ...moa, id: docRef.id });
      });
      await batch.commit();
      toast({
        title: "Database Seeded",
        description: "Institutional registry populated with sample records.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: "Could not populate initial records.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

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
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Command Center</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Real-time institutional agreement monitoring and analytics.
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && moas?.length === 0 && (
            <Button 
              variant="outline" 
              className="border-accent text-accent-foreground hover:bg-accent/10 font-bold"
              onClick={seedDatabase}
              disabled={isSeeding}
            >
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="mr-2 h-4 w-4" />}
              Seed Sample Data
            </Button>
          )}
          <Button variant="outline" className="border-border font-semibold shadow-sm bg-white">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-muted-foreground" /> Export CSV
          </Button>
          {(isAdmin || (isFaculty && user.canEdit)) && (
            <AddMoaDialog>
              <Button className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all font-semibold">
                <PlusCircle className="mr-2 h-4 w-4 text-accent" /> Create Record
              </Button>
            </AddMoaDialog>
          )}
        </div>
      </div>

      <MoaStats moas={filteredMoas as any} />

      <Card className="border-none shadow-sm bg-white/50 ring-1 ring-border">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Company, HTE, or ID..." 
              className="pl-10 bg-white border-border focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="w-[160px] bg-white border-border font-medium">
                  <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px] bg-white border-border font-medium">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white border-border font-medium">
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

            <Button variant="outline" className="gap-2 bg-white border-border font-medium">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Date Range</span>
            </Button>

            {(searchQuery || collegeFilter !== "all" || industryFilter !== "all" || statusFilter !== "all") && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => {
                setSearchQuery("");
                setCollegeFilter("all");
                setIndustryFilter("all");
                setStatusFilter("all");
              }}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-md rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-sidebar text-sidebar-foreground">
                <TableRow className="hover:bg-transparent border-sidebar-border">
                  <TableHead className="w-[320px] text-white font-bold py-5">Company Entity</TableHead>
                  <TableHead className="text-white font-bold">Industry Segment</TableHead>
                  <TableHead className="text-white font-bold">Primary Contact</TableHead>
                  <TableHead className="text-white font-bold">Effective Date</TableHead>
                  <TableHead className="text-white font-bold">College</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-right text-white font-bold pr-6">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-muted p-4 rounded-full">
                          <Database className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-bold text-lg">No MOA records found.</p>
                          <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            The institutional database is currently empty. Use the <b>Create Record</b> button to add a new agreement.
                          </p>
                        </div>
                        {isAdmin && (
                          <Button 
                            variant="link" 
                            className="text-primary font-bold" 
                            onClick={seedDatabase}
                            disabled={isSeeding}
                          >
                            Populate with sample data
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMoas.map((moa) => (
                    <TableRow key={moa.id} className="hover:bg-muted/50 transition-colors border-border group">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground text-base leading-none">{moa.companyName}</span>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{moa.hteId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-border text-muted-foreground bg-muted/20">
                          {moa.industryType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{moa.contactPerson}</span>
                          <span className="text-xs text-muted-foreground font-medium">{moa.contactPersonEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-bold">
                        {moa.effectiveDate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {moa.college}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(moa.status)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => setEditingMoa(moa as any)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
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
        <div className="bg-muted/20 px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Displaying {filteredMoas.length} of {moas?.length || 0} Total Institutional Records
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="text-xs font-bold border-border bg-white">Previous</Button>
            <Button variant="outline" size="sm" disabled className="text-xs font-bold border-border bg-white">Next</Button>
          </div>
        </div>
      </Card>

      <EditMoaDialog 
        moa={editingMoa} 
        open={!!editingMoa} 
        onOpenChange={(open) => !open && setEditingMoa(null)} 
      />
    </div>
  );
}