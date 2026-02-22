import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { getPostBySlug } from "@/actions/post.actions";

import ViewTracker from "@/components/public/ViewTracker";
import LikeButton from "@/components/public/LikeButton";
import BookmarkButton from "@/components/public/BookmarkButton";
import { ShareDialog } from "@/components/shared/ShareDialog";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Eye } from "lucide-react";
import TextHighlight from "@/components/animations/TextHighlight";
import CommentSection from "@/components/blog/CommentSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags, // 👈 Uses the new tags array
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
      images: [
        {
          url: post.coverImage,
          alt: post.coverImageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  // 1. Fetch the Post
  const response = await getPostBySlug(slug);
  if (!response.success || !response.data) {
    notFound(); // Triggers the Next.js 404 page if the slug is wrong or draft
  }
  const post = response.data;

  // 2. Determine User's Relationship with the Post (Likes & Bookmarks)
  const userId = session?.user?.id;
  const initialIsLiked = userId ? post.likes.includes(userId) : false;

  let initialIsBookmarked = false;
  if (userId && session.user.email) {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email })
      .select("bookmarks")
      .lean();
    if (user?.bookmarks) {
      initialIsBookmarked = user.bookmarks
        .map((id: any) => id.toString())
        .includes(post._id);
    }
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* 👈 THE INVISIBLE ENGINE: This increments the views safely! */}
      <ViewTracker postId={post._id} />

      {/* Header Section */}
      <div className="text-center mb-10 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          {post.category ? (
            <Link
              href={`/category/${post.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {post.category.title}
            </Link>
          ) : (
            <span>Uncategorized</span>
          )}
          <span>›</span>
          <span className="truncate max-w-[200px] text-foreground font-medium">
            {post.title}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Meta Data Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground border-y py-6 border-slate-100 dark:border-slate-800 w-full sm:w-fit mx-auto px-4 sm:px-12">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border shadow-sm">
              <AvatarImage
                src={post.author?.image}
                alt={post.teamId?.name || post.author?.name}
              />
              <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
                {(post.teamId?.name || post.author?.name)?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground text-nowrap">
              {post.teamId?.name || post.author?.name || "Unknown"}
            </span>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>

          {/* Date */}
          <div className="flex items-center gap-2 text-nowrap">
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>

          {/* Views */}
          <div
            className="flex items-center gap-1"
            title={`${post.views || 0} views`}
          >
            <Eye className="w-4 h-4" />
            <span>{post.views || 0}</span>
          </div>

          <span className="hidden sm:inline text-slate-300">|</span>

          {/* Actions: Like, Bookmark, Share */}
          <div className="flex items-center gap-3">
            <LikeButton
              postId={post._id}
              initialLikes={post.likes.length}
              initialIsLiked={initialIsLiked}
              userId={userId}
            />
            <BookmarkButton
              postId={post._id}
              initialIsBookmarked={initialIsBookmarked}
              userId={userId}
            />
            <ShareDialog
              title={post.title}
              text={post.description}
              url={`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`}
              image={post.coverImage}
            />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {post.coverImage && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-12 bg-slate-100 dark:bg-slate-800">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Description / Intro */}
      {post.description && (
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 italic leading-relaxed font-serif">
            {post.description}
          </p>
        </div>
      )}

      {/* Article Content */}
      <div
        className="prose prose-slate prose-lg md:prose-xl max-w-3xl mx-auto 
                   prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary 
                   prose-img:rounded-xl prose-img:shadow-md dark:prose-invert"
      >
        <TextHighlight className="text-slate-800 dark:text-slate-200 leading-8">
          {post.content}
        </TextHighlight>
      </div>

      {/* Comment Section */}
      <CommentSection postId={post._id} />
    </article>
  );
}
