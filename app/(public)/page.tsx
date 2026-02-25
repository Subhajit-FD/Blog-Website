import dynamic from "next/dynamic";
import {
  getLatestPost,
  getEditorsChoicePosts,
  getTrendingPosts,
  getRandomCategoryPost,
  getRandomPosts,
} from "@/actions/post.actions";
import HeroPost from "@/components/home/HeroPost";

// Lazy-load below-fold sections to reduce initial JS parsing & TBT
const EditorsChoice = dynamic(() => import("@/components/home/EditorsChoice"), {
  loading: () => (
    <div className="h-64 animate-pulse bg-muted rounded-xl my-8" />
  ),
});
const CategoryFeature = dynamic(
  () => import("@/components/home/CategoryFeature"),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-muted rounded-xl my-8" />
    ),
  },
);

// Enable Incremental Static Regeneration (ISR) — home page rebuilt every 30 minutes
export const revalidate = 1800;

export default async function HomePage() {
  // Execute all fetches concurrently to drastically improve page load speeds
  const [
    latestPostRes,
    editorsChoiceRes,
    trendingRes,
    randomCategoryRes,
    randomPostsRes,
  ] = await Promise.all([
    getLatestPost(),
    getEditorsChoicePosts(),
    getTrendingPosts(),
    getRandomCategoryPost(),
    getRandomPosts(12),
  ]);

  const latestPost = latestPostRes.success ? latestPostRes.data : null;
  const editorsChoicePosts = editorsChoiceRes.success
    ? editorsChoiceRes.data
    : [];
  const trendingPosts = trendingRes.success ? trendingRes.data : [];
  const categoryHighlight = randomCategoryRes.success
    ? randomCategoryRes.data
    : null;
  const randomPosts = randomPostsRes.success ? randomPostsRes.data : [];

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="container mx-auto px-4 md:px-6">
        {/* 1. HERO SECTION — above fold, eager loaded */}
        {latestPost ? (
          <HeroPost post={latestPost} />
        ) : (
          <h1 className="sr-only">
            BlogZenx — Discover the latest stories and insights
          </h1>
        )}

        {/* 2. EDITOR'S CHOICE — below fold, lazy loaded */}
        <EditorsChoice posts={editorsChoicePosts} />

        {/* 3. CATEGORY FEATURE & TRENDING SIDEBAR — below fold, lazy loaded */}
        <CategoryFeature
          categoryPost={categoryHighlight}
          trendingPosts={trendingPosts.filter(
            (p) => p._id !== categoryHighlight?._id,
          )}
          randomPosts={randomPosts}
        />
      </main>
    </div>
  );
}
