import {
  getLatestPost,
  getEditorsChoicePosts,
  getTrendingPosts,
  getPostsByCategory,
  getRandomCategoryPost,
  getRandomPosts,
} from "@/actions/post.actions";
import HeroPost from "@/components/home/HeroPost";
import EditorsChoice from "@/components/home/EditorsChoice";
import CategoryFeature from "@/components/home/CategoryFeature";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch Latest Post (Hero)
  const latestPostRes = await getLatestPost();
  const latestPost = latestPostRes.success ? latestPostRes.data : null;

  // 2. Fetch Editor's Choice
  const editorsChoiceRes = await getEditorsChoicePosts();
  const editorsChoicePosts = editorsChoiceRes.success
    ? editorsChoiceRes.data
    : [];

  // 3. Fetch Trending Posts
  const trendingRes = await getTrendingPosts();
  const trendingPosts = trendingRes.success ? trendingRes.data : [];

  // 4. Fetch Random Category Feature
  const randomCategoryRes = await getRandomCategoryPost();
  const categoryHighlight = randomCategoryRes.success
    ? randomCategoryRes.data
    : null;

  // 5. Fetch Random Posts for Pagination Feature
  const randomPostsRes = await getRandomPosts(12);
  const randomPosts = randomPostsRes.success ? randomPostsRes.data : [];

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="container mx-auto px-4 md:px-6">
        {/* 1. HERO SECTION */}
        <HeroPost post={latestPost} />

        {/* 2. EDITOR'S CHOICE */}
        <EditorsChoice posts={editorsChoicePosts} />

        {/* 3. CATEGORY FEATURE & TRENDING SIDEBAR */}
        {/* Using the first trending post as the 'Category Highlight' for now to ensure layout is visible */}
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
