import PostCard from "@/components/blog/PostCard";

interface EditorsChoiceProps {
  posts: any[];
}

export default function EditorsChoice({ posts }: EditorsChoiceProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap">
          Editor&apos;s Choice ⭐
        </h2>
        <div className="flex items-center justify-between w-full md:w-fit">
          <span className="text-muted-foreground text-sm whitespace-nowrap mr-3 uppercase">
            Curated just for you
          </span>
          <hr className="w-full border-border bg-accent md:hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} variant="compact" />
        ))}
      </div>
    </section>
  );
}
