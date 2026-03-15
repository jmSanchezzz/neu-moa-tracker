"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOA, NEU_COLLEGES } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

type MoaCollegeChartProps = {
  moas: MOA[];
};

type ChartRow = {
  fullName: string;
  shortName: string;
  value: number;
  isOthers?: boolean;
};

const COLLEGE_ABBR: Record<string, string> = {
  "College of Accountancy": "COA",
  "College of Agriculture": "CAG",
  "College of Architecture": "CA",
  "College of Arts and Sciences": "CAS",
  "College of Business Administration": "CBA",
  "College of Communication": "CCOM",
  "College of Criminology": "CCR",
  "College of Education": "CED",
  "College of Engineering and Technology": "CET",
  "College of Informatics and Computing Studies": "CICS",
  "College of Law": "CLAW",
  "College of Medical Technology": "CMT",
  "College of Medicine": "CMED",
  "College of Midwifery": "CMW",
  "College of Music": "CMUS",
  "College of Nursing": "CON",
  "College of Physical Therapy": "CPT",
  "College of Respiratory Therapy": "CRT",
  "School of International Relations": "SIR",
  "School of Graduate Studies": "SGS",
};

const toCollegeAbbr = (name: string) => {
  if (COLLEGE_ABBR[name]) {
    return COLLEGE_ABBR[name];
  }

  return name
    .replace(/^College of\s+/i, "")
    .replace(/^School of\s+/i, "")
    .substring(0, 4)
    .toUpperCase();
};

const PRIMARY_BAR = "#2563eb";
const SECONDARY_BAR = "#93c5fd";
const OTHERS_BAR = "#94a3b8";

function CollegeTooltip({ active, payload, total }: { active?: boolean; payload?: any[]; total: number }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) {
    return null;
  }

  const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{row.fullName}</p>
      <p className="text-slate-600">MOAs: <span className="font-semibold text-slate-800">{row.value}</span></p>
      <p className="text-slate-600">Share: <span className="font-semibold text-slate-800">{percentage}%</span></p>
    </div>
  );
}

export function MoaCollegeChart({ moas }: MoaCollegeChartProps) {
  const chartData = useMemo(() => {
    const counts = NEU_COLLEGES.reduce<Record<string, number>>((acc, college) => {
      acc[college] = 0;
      return acc;
    }, {});

    for (const moa of moas) {
      const college = moa.college?.trim();
      if (college && Object.prototype.hasOwnProperty.call(counts, college)) {
        counts[college] += 1;
      }
    }

    const sortedRows: ChartRow[] = Object.entries(counts)
      .map(([fullName, value]) => ({
        fullName,
        shortName: toCollegeAbbr(fullName),
        value,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const topSix: ChartRow[] = sortedRows.slice(0, 6);
    const remaining = sortedRows.slice(6);
    const othersTotal = remaining.reduce((sum, item) => sum + item.value, 0);

    if (othersTotal > 0) {
      topSix.push({
        fullName: "Others",
        shortName: "Others",
        value: othersTotal,
        isOthers: true,
      });
    }

    return topSix as ChartRow[];
  }, [moas]);

  const totalMoas = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle>MOA by College</CardTitle>
        <CardDescription>Distribution of agreements across endorsing colleges.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chart data available.</p>
        ) : (
          <div className="h-full min-h-[420px] w-full xl:min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 8, right: 36, left: 8, bottom: 8 }}
                barCategoryGap="24%"
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="shortName"
                  type="category"
                  width={64}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#475569", fontWeight: 600 }}
                >
                </YAxis>
                <Tooltip
                  cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
                  content={<CollegeTooltip total={totalMoas} />}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30} minPointSize={10}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.fullName}
                      fill={entry.isOthers ? OTHERS_BAR : index === 0 ? PRIMARY_BAR : SECONDARY_BAR}
                    />
                  ))}
                  <LabelList dataKey="value" position="right" offset={10} fill="#334155" fontSize={12} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}