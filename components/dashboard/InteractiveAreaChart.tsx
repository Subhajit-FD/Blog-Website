"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { getAnalyticsData } from "@/actions/analytics.actions";
import { Loader2 } from "lucide-react";

export default function InteractiveAreaChart() {
  const [timeRange, setTimeRange] = useState<
    "90daysAgo" | "30daysAgo" | "7daysAgo"
  >("90daysAgo");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAnalyticsData(timeRange);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setData(response.data);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  // If there's no data or we haven't fetched it yet, use empty arrays for calculation
  const filteredData = data;

  // Calculate totals
  const totalDesktop = useMemo(
    () => filteredData.reduce((acc, curr) => acc + (curr.desktop || 0), 0),
    [filteredData],
  );
  const totalMobile = useMemo(
    () =>
      filteredData.reduce(
        (acc, curr) => acc + (curr.mobile || 0) + (curr.tablet || 0),
        0,
      ),
    [filteredData],
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Format the date (e.g., "Apr 8")
      const date = new Date(label).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm flex flex-col gap-2 min-w-[150px]">
          <p className="font-semibold text-foreground border-b pb-1 mb-1">
            {date}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: "hsl(var(--chart-1))" }}
              ></div>
              <span className="text-muted-foreground">Desktop</span>
            </div>
            <span className="font-bold">{payload[1].value}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: "hsl(var(--chart-2))" }}
              ></div>
              <span className="text-muted-foreground">Mobile</span>
            </div>
            <span className="font-bold">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col mb-8">
      {/* Header Segment */}
      <div className="flex flex-col md:flex-row md:items-start justify-between border-b p-4 md:p-6 gap-4 md:gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Total Visitors</h2>
          <p className="text-sm text-muted-foreground">
            Showing total active users for the last{" "}
            {timeRange === "90daysAgo"
              ? "3 months"
              : timeRange === "30daysAgo"
                ? "30 days"
                : "7 days"}
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div>
              <div className="text-2xl font-black">
                {(totalDesktop + totalMobile).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex bg-muted/50 p-1 rounded-lg w-full sm:w-fit h-fit border shadow-sm">
          <Button
            variant={timeRange === "90daysAgo" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("90daysAgo")}
            className="rounded-md px-3 md:px-4 text-xs md:text-sm font-medium transition-all flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Last 3 months
          </Button>
          <Button
            variant={timeRange === "30daysAgo" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("30daysAgo")}
            className="rounded-md px-3 md:px-4 text-xs md:text-sm font-medium transition-all flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Last 30 days
          </Button>
          <Button
            variant={timeRange === "7daysAgo" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("7daysAgo")}
            className="rounded-md px-3 md:px-4 text-xs md:text-sm font-medium transition-all flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Last 7 days
          </Button>
        </div>
      </div>

      {/* States Segment */}
      {isLoading && (
        <div className="flex justify-center items-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col justify-center items-center h-[350px] p-6 text-center text-muted-foreground">
          <p className="mb-2 font-medium">Analytics Currently Unavailable</p>
          <p className="text-sm w-full max-w-sm mb-4">{error}</p>
          <p className="text-xs max-w-md opacity-80 border border-dashed p-4 rounded-lg">
            To view real data, configure `GA_CLIENT_EMAIL`, `GA_PRIVATE_KEY` and
            `GA_PROPERTY_ID` in your `.env.local` to enable Google Analytics
            data fetching.
          </p>
        </div>
      )}

      {/* Chart Segment */}
      {!isLoading && !error && (
        <div className="p-4 md:p-6 pt-0 mt-2 w-full">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                minTickGap={30}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-xs font-medium fill-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                className="text-xs font-medium fill-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
              />
              <Area
                type="natural"
                dataKey="mobile"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="url(#fillMobile)"
                strokeWidth={2}
              />
              <Area
                type="natural"
                dataKey="desktop"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="url(#fillDesktop)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
