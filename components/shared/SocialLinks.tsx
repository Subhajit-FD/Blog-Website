"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface SocialLink {
  title: string;
  url: string;
  icon?: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
}

export default function SocialLinks({
  links,
  className,
  iconClassName,
}: SocialLinksProps) {
  if (!links || links.length === 0) return null;

  const renderIcon = (iconString?: string) => {
    if (!iconString)
      return <ExternalLink className={cn("w-5 h-5", iconClassName)} />;

    // Simple check: if it looks like a full SVG tag
    if (iconString.trim().startsWith("<svg")) {
      return (
        <span
          className={cn(
            "w-5 h-5 block [&>svg]:w-full [&>svg]:h-full",
            iconClassName,
          )}
          dangerouslySetInnerHTML={{ __html: iconString }}
        />
      );
    }

    // Assume it's a path d="..."
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        className={cn("w-5 h-5", iconClassName)}
      >
        <path d={iconString} />
      </svg>
    );
  };

  return (
    <div className={cn("flex gap-4", className)}>
      {links.map((link, i) => (
        <Link
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          title={link.title}
        >
          {renderIcon(link.icon)}
          <span className="sr-only">{link.title}</span>
        </Link>
      ))}
    </div>
  );
}
