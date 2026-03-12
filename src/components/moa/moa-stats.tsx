"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOA } from "@/lib/mock-data";
import { CheckCircle2, Clock, AlertTriangle, Users, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type MoaStatsProps = {
  moas: MOA[];
};

export function MoaStats({ moas }: MoaStatsProps) {
  // Expiring logic: APPROVED and within 60 days
  const isExpiring = (moa: any) => {
    if (moa.primaryStatus !== 'APPROVED') return false;
    try {
      const expDate = moa.expirationDate?.toDate 
        ? moa.expirationDate.toDate() 
        : new Date(moa.expirationDate);
      
      if (isNaN(expDate.getTime())) return false;
      
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Expiring if within 60 days but not yet passed
      return diffDays > 0 && diffDays <= 60;
    } catch (e) {
      return false;
    }
  };

  const activeCount = moas.filter(m => m.primaryStatus === 'APPROVED' && !m.isDeleted).length;
  const processingCount = moas.filter(m => m.primaryStatus === 'PROCESSING' && !m.isDeleted).length;
  const expiringCount = moas.filter(m => isExpiring(m) && !m.isDeleted).length;
  const totalCount = moas.length;

  const stats = [
    {
      title: "Active Agreements",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+4.2%",
      isPositive: true,
      link: "/dashboard/moas?status=APPROVED"
    },
    {
      title: "Processing Queue",
      value: processingCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "-1.2%",
      isPositive: false,
      link: "/dashboard/moas?status=PROCESSING"
    },
    {
      title: "Critical Expiring",
      value: expiringCount,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "+12.1%",
      isPositive: true,
      link: "/dashboard/moas?status=EXPIRING"
    },
    {
      title: "Total Partners",
      value: totalCount,
      icon: Users,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      trend: "+8.5%",
      isPositive: true,
      link: "/dashboard/moas"
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.link} className="block">
        <Card className="relative overflow-hidden border border-slate-200 shadow-md group hover:border-accent/50 transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">{stat.title}</CardTitle>
            <span className="text-slate-300 group-hover:text-accent transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-black tracking-tighter text-slate-900">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {stat.trend}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">vs Last Cycle</span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg ring-1 ring-black/5`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100 group-hover:bg-accent transition-colors" />
        </Card>
        </Link>
      ))}
    </div>
  );
}