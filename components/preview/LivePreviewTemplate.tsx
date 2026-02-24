"use client";

import Image from "next/image";
import TextHighlight from "@/components/animations/TextHighlight";

import { Eye, Heart, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LivePreviewTemplate({ data }: { data: any }) {
  if (!data) return null;

  const { title, categoryTitle, coverImage, content, description, author } =
    data;

  // Mock data for visualizations
  const mockAuthor = author || { name: "Sarah", image: "" };
  const mockDate = new Date();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8 max-w-4xl mx-auto">
        <div className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
          <span>Home</span>
          <span>›</span>
          <span>{categoryTitle || "Lifestyle"}</span>
          <span>›</span>
          <span className="truncate max-w-[200px]">{title}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {title ||
            "Blue Copper Kitchen Ideas: How to Create a Timeless, Elegant Space"}
        </h1>

        {/* Meta Data */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-y py-4 border-slate-100 dark:border-slate-800 w-fit mx-auto px-8">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockAuthor.image} />
              <AvatarFallback className="bg-slate-200 text-slate-600">
                {mockAuthor.name?.[0] || "S"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">
              {mockAuthor.name || "Sarah"}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span>
              {mockDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>8</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>1</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl mb-12 bg-slate-100 dark:bg-slate-800">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title || "Cover Image"}
            fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No Cover Image
          </div>
        )}
      </div>

      {/* Quote / Description */}
      {description && (
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 italic leading-relaxed font-serif">
            {description}
          </p>
        </div>
      )}

      {/* Main Content with TextHighlight */}
      <div className="prose prose-lg dark:prose-invert prose-slate max-w-3xl mx-auto">
        {/* We pass the HTML content to TextHighlight. 
             It needs to be updated to handle HTML strings. */}
        <TextHighlight className="text-slate-800 dark:text-slate-200 leading-8">
          {content || "<p>Start writing to see the preview...</p>"}
        </TextHighlight>
      </div>
    </div>
  );
}
