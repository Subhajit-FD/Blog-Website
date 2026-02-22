"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopPerformersProps {
  posts: {
    _id: string;
    title: string;
    slug: string;
    views: number;
    likes: string[];
    createdAt: string;
  }[];
}

const CustomTooltip = ({ active, payload, currentFilter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm flex flex-col gap-1 max-w-[250px] min-w-[150px]">
        <p className="font-semibold text-foreground line-clamp-2 leading-tight border-b pb-1 mb-1">
          {payload[0].payload.fullTitle}
        </p>
        <div className="font-medium flex items-center justify-between gap-1 mt-1">
          <span className="flex items-center gap-2 text-muted-foreground">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{
                backgroundColor: `var(--chart-${currentFilter === "views" ? "1" : "2"})`,
              }}
            ></div>
            {currentFilter === "views" ? "Views" : "Likes"}
          </span>
          <span className="font-bold text-foreground">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TopPerformers({ posts }: TopPerformersProps) {
  const [filter, setFilter] = useState<"views" | "likes">("views");

  // Format data for chart
  const initialData = posts.map((post) => ({
    name:
      post.title.length > 25 ? post.title.substring(0, 25) + "..." : post.title,
    fullTitle: post.title,
    slug: post.slug,
    views: post.views || 0,
    likes: post.likes?.length || 0,
  }));

  // Sort based on active filter
  const sortedData = [...initialData]
    .sort((a, b) => b[filter] - a[filter])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-fit">
        <Button
          variant={filter === "views" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("views")}
          className="rounded-md px-4"
        >
          <Eye className="w-4 h-4 mr-2" /> Top by Views
        </Button>
        <Button
          variant={filter === "likes" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("likes")}
          className="rounded-md px-4"
        >
          <Heart className="w-4 h-4 mr-2" /> Top by Likes
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full h-[350px] mt-4">
        {sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value}
                className="text-xs font-medium fill-muted-foreground"
                tick={{ fill: "var(--muted-foreground)" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs font-medium fill-muted-foreground"
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)" }}
                content={<CustomTooltip currentFilter={filter} />}
              />
              <Bar
                dataKey={filter}
                fill={`var(--chart-${filter === "views" ? "1" : "2"})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            No published metrics found.
          </div>
        )}
      </div>

      {/* Traditional List below for easier navigation */}
      <div className="mt-8 pt-6 border-t space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Data Breakdown
        </h3>
        {sortedData.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors border group"
          >
            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-black w-6 text-muted-foreground/30 transition-colors`}
              >
                {index + 1}
              </span>
              <span className="font-medium group-hover:text-primary line-clamp-1">
                {post.fullTitle}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-foreground">
              <span
                className={`flex items-center w-12 justify-end ${filter === "views" ? "font-bold" : "text-muted-foreground"}`}
              >
                <Eye className="w-3 h-3 mr-1" /> {post.views}
              </span>
              <span
                className={`flex items-center w-12 justify-end ${filter === "likes" ? "font-bold" : "text-muted-foreground"}`}
              >
                <Heart className="w-3 h-3 mr-1" /> {post.likes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
