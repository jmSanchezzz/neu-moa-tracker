"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { MoaStats } from "@/components/moa/moa-stats";
import { MOCK_MOAS, MOA } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  PlusCircle, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileSpreadsheet
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isFaculty = user.role === 'FACULTY';
  const isStudent = user.role === 'STUDENT';

  const colleges = Array.from(new Set(MOCK_MOAS.map(m => m.college)));
  const industries = Array.from(new Set(MOCK_MOAS.map(m => m.industryType)));

  const filteredMoas = useMemo(() => {
    return MOCK_MOAS.filter(moa => {
      if (isStudent && moa.status !== 'APPROVED') return false;
      if ((isStudent || isFaculty) && moa.isDeleted) return false;

      const matchesSearch = 
        moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.hteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        moa.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollege = collegeFilter === "all" || moa.college === collegeFilter;
      const matchesIndustry = industryFilter === "all" || moa.industryType === industryFilter;

      return matchesSearch && matchesCollege && matchesIndustry;
    });
  }, [searchQuery, collegeFilter, industryFilter, isStudent, isFaculty]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Approved</Badge>;
      case 'PROCESSING': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Processing</Badge>;
      case 'EXPIRING': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Expiring</Badge>;
      case 'EXPIRED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Expired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Admin Command Center</h2>
          <p className="text-muted-foreground">
            Centralized monitoring and management for institutional agreements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Data
          </Button>
          {(isAdmin || (isFaculty && user.canEdit)) && (
            <Button className="bg-primary shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Record
            </Button>
          )}
        </div>
      </div>

      <MoaStats moas={filteredMoas} />

      {/* Control Bar */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Company, HTE, or ID..." 
              className="pl-10 bg-background border-none ring-1 ring-border focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 bg-background">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Select Date Range</span>
            </Button>

            {(searchQuery || collegeFilter !== "all" || industryFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => {
                setSearchQuery("");
                setCollegeFilter("all");
                setIndustryFilter("all");
              }}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Master Data Table */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Master MOA Records
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none">
              {filteredMoas.length} Total
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[280px]">Company Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Endorsed By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No matching records found in the database.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMoas.map((moa) => (
                    <TableRow key={moa.id} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-bold text-primary">
                        <div className="flex flex-col">
                          <span>{moa.companyName}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">{moa.hteId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium bg-muted/20">{moa.industryType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{moa.contactPerson}</span>
                          <span className="text-xs text-muted-foreground">{moa.contactPersonEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {moa.effectiveDate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {moa.college}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(moa.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}