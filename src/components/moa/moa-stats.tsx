"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOA } from "@/lib/mock-data";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

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
      bgColor: "bg-green-100",
    },
    {
      title: "Processing",
      value: processingCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Expiring Soon",
      value: expiringCount,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Expired",
      value: expiredCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-full`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently tracked in system
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}