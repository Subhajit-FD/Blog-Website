import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface HeroPostProps {
  post: any;
}

export default function HeroPost({ post }: HeroPostProps) {
  if (!post) return null;

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-xl my-8">
      {/* Background Image */}
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fetchPriority="high"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 flex flex-col items-start gap-4 text-white z-10">
        {post.category && (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm md:text-base px-3 py-1">
            {post.category.title}
          </Badge>
        )}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] max-w-4xl tracking-tight text-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1200">
          {post.title}
        </h1>
        <p className="text-gray-200 text-sm md:text-base max-w-lg line-clamp-2">
          {post.description}
        </p>

        <div className="flex flex-col-reverse items-start md:flex-row md:items-center gap-4 mt-4">
          <Link href={`/blog/${post.slug}`}>
            <Button size="lg" className="gap-2 text-base font-semibold">
              Read Article <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm md:text-base font-medium text-gray-300">
            <span>
              By {post.teamId?.name || post.author?.name || "Anonymous"}
            </span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
