"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOA } from "@/lib/mock-data";
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type MoaStatsProps = {
  moas: MOA[];
};

export function MoaStats({ moas }: MoaStatsProps) {
  const activeCount = moas.filter(m => m.status === 'APPROVED' && !m.isDeleted).length;
  const processingCount = moas.filter(m => m.status === 'PROCESSING' && !m.isDeleted).length;
  const expiredCount = moas.filter(m => m.status === 'EXPIRED' && !m.isDeleted).length;
  const expiringCount = moas.filter(m => m.status === 'EXPIRING' && !m.isDeleted).length;

  const stats = [
    {
      title: "Active MOAs",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100/50",
      trend: "+8.2%",
      isPositive: true,
      link: "/dashboard/moas?status=APPROVED"
    },
    {
      title: "Processing",
      value: processingCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100/50",
      trend: "-2.4%",
      isPositive: false,
      link: "/dashboard/moas?status=PROCESSING"
    },
    {
      title: "Expiring Soon",
      value: expiringCount,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
      trend: "+12.1%",
      isPositive: true,
      link: "/dashboard/moas?status=EXPIRING"
    },
    {
      title: "Expired",
      value: expiredCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100/50",
      trend: "+0.5%",
      isPositive: false,
      link: "/dashboard/moas?status=EXPIRED"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden border-none shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
            <Link href={stat.link} className="hover:text-primary transition-colors">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend} <span className="text-muted-foreground font-normal">vs last month</span>
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}