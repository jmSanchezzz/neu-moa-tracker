"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOA } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type MoaStatusDistributionChartProps = {
  moas: MOA[];
};

type StatusRow = {
  key: "active" | "processing" | "expiringSoon" | "expired";
  label: string;
  value: number;
  color: string;
};

const EXPIRING_WINDOW_DAYS = 60;

const STATUS_COLORS = {
  active: "#16a34a",
  processing: "#2563eb",
  expiringSoon: "#f59e0b",
  expired: "#dc2626",
} as const;

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return ((value as { toDate: () => Date }).toDate());
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isExpiringSoon(moa: MOA): boolean {
  if (moa.primaryStatus !== "APPROVED") return false;

  const expirationDate = toDate(moa.expirationDate);
  if (!expirationDate) return false;

  const now = new Date();
  const diffDays = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= EXPIRING_WINDOW_DAYS;
}

function StatusTooltip({ active, payload, total }: { active?: boolean; payload?: Array<{ payload?: StatusRow }>; total: number }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  const percent = total > 0 ? ((row.value / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{row.label}</p>
      <p className="text-slate-600">Count: <span className="font-semibold text-slate-800">{row.value}</span></p>
      <p className="text-slate-600">Share: <span className="font-semibold text-slate-800">{percent}%</span></p>
    </div>
  );
}

export function MoaStatusDistributionChart({ moas }: MoaStatusDistributionChartProps) {
  const chartData = useMemo<StatusRow[]>(() => {
    const totals = {
      active: 0,
      processing: 0,
      expiringSoon: 0,
      expired: 0,
    };

    for (const moa of moas) {
      if (moa.isDeleted) {
        continue;
      }

      if (moa.primaryStatus === "PROCESSING") {
        totals.processing += 1;
        continue;
      }

      if (moa.primaryStatus === "EXPIRED") {
        totals.expired += 1;
        continue;
      }

      if (moa.primaryStatus === "APPROVED") {
        if (isExpiringSoon(moa)) {
          totals.expiringSoon += 1;
        } else {
          totals.active += 1;
        }
      }
    }

    return [
      {
        key: "active",
        label: "Active Agreements",
        value: totals.active,
        color: STATUS_COLORS.active,
      },
      {
        key: "processing",
        label: "Processing",
        value: totals.processing,
        color: STATUS_COLORS.processing,
      },
      {
        key: "expiringSoon",
        label: "Expiring Soon",
        value: totals.expiringSoon,
        color: STATUS_COLORS.expiringSoon,
      },
      {
        key: "expired",
        label: "Expired",
        value: totals.expired,
        color: STATUS_COLORS.expired,
      },
    ];
  }, [moas]);

  const totalMoas = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle>MOA Status Distribution</CardTitle>
        <CardDescription>Overview of agreement statuses across the system</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {totalMoas === 0 ? (
          <p className="text-sm text-muted-foreground">No chart data available.</p>
        ) : (
          <>
            {/* 1. Adjusted height to 300px to tighten the gap without shrinking the chart, and added mb-4 */}
            <div className="relative h-[300px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={3}
                    strokeWidth={0}
                    className="cursor-pointer outline-none hover:opacity-90 transition-opacity"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip total={totalMoas} />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-extrabold leading-none text-primary">{totalMoas}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total MOAs</p>
              </div>
            </div>

            {/* 2. Removed mt-auto so it pulls up closer to the chart, and increased spacing between items */}
            <div className="w-full space-y-3">
              {chartData.map((item) => {
                const percent = totalMoas > 0 ? ((item.value / totalMoas) * 100).toFixed(1) : "0.0";
                return (
                  // 3. Increased padding, added a subtle hover effect
                  <div key={item.key} className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* 4. Made the colored dot slightly larger */}
                      <span className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      {/* 5. Increased font size from text-sm to text-base */}
                      <span className="text-base font-medium text-slate-700">{item.label}</span>
                    </div>
                    {/* 6. Increased font size from text-sm to text-base */}
                    <span className="text-base font-semibold text-slate-800">{item.value} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}