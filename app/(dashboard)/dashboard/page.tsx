import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import Note from "@/lib/models/Note";
import { auth } from "@/auth";
import Link from "next/link";
// import { revalidatePath } from "next/cache"; // Removed if no longer used directly

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Users, Eye, Heart } from "lucide-react";
// import { Button } from "@/components/ui/button"; // Moved to MemoBoard
// import { Input } from "@/components/ui/input";   // Moved to MemoBoard
import MemoBoard from "@/components/dashboard/MemoBoard";
import TopPerformers from "@/components/dashboard/TopPerformers";
import InteractiveAreaChart from "@/components/dashboard/InteractiveAreaChart";

export default async function DashboardOverview() {
  await connectToDatabase();
  const session = await auth();

  // Fetch everything in parallel for maximum performance
  const [postCount, userCount, posts, notes] = await Promise.all([
    Post.countDocuments(),
    User.countDocuments(),
    Post.find().select("title views likes createdAt slug").lean(),
    Note.find().populate("author", "name").sort({ createdAt: -1 }).lean(),
  ]);

  // Aggregate stats
  const totalViews = posts.reduce(
    (sum, post: any) => sum + (post.views || 0),
    0,
  );
  const totalLikes = posts.reduce(
    (sum, post: any) => sum + (post.likes?.length || 0),
    0,
  );

  // Sorting
  const top10Posts = [...posts]
    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);
  const latestPost = [...posts].sort(
    (a: any, b: any) => b.createdAt - a.createdAt,
  )[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-muted-foreground">
          Real-time system metrics and administrative overview.
        </p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">
              {totalLikes.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">
              Published Blogs
            </CardTitle>
            <FileText className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{postCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">
              Registered Users
            </CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* LEFT COLUMN: Top Blogs */}
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          <InteractiveAreaChart />

          <div className="bg-card border rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-3 mb-6">
              <h2 className="text-xl font-bold">Top 10 Performing Blogs</h2>
              {latestPost && (
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium inline-flex whitespace-nowrap">
                  Latest:{" "}
                  {latestPost.title.length > 25
                    ? latestPost.title.substring(0, 25) + "..."
                    : latestPost.title}
                </span>
              )}
            </div>

            <TopPerformers posts={JSON.parse(JSON.stringify(posts))} />
          </div>
        </div>

        {/* RIGHT COLUMN: Ephemeral Notes */}
        <div className="space-y-4">
          <MemoBoard
            notes={JSON.parse(JSON.stringify(notes))}
            currentUser={
              session?.user
                ? {
                    id: session.user.id,
                    permissions: session.user.permissions,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
