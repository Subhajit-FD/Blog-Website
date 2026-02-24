"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Check,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { getSettings } from "@/actions/settings.actions";
import Image from "next/image";

interface ShareDialogProps {
  title: string;
  text?: string;
  url: string;
  image?: string;
}

export function ShareDialog({ title, text, url, image }: ShareDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="group" title="Share">
          <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Share this article</DrawerTitle>
          <DrawerDescription>
            Share this article with your friends and network.
          </DrawerDescription>
        </DrawerHeader>
        {/* Added overflow-hidden to ensure it doesn't break Drawer boundaries */}
        <div className="px-4 overflow-hidden">
          <ShareOptions url={url} title={title} text={text} image={image} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="group" title="Share">
          <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Button>
      </DialogTrigger>
      {/* Fixed: Added sm:max-w-md and w-[95vw] to properly bound the Dialog */}
      <DialogContent className="w-[95vw] sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Share this article</DialogTitle>
          <DialogDescription>
            Share this article with your friends and network.
          </DialogDescription>
        </DialogHeader>
        <ShareOptions url={url} title={title} text={text} image={image} />
      </DialogContent>
    </Dialog>
  );
}

function ShareOptions({ url, title, text, image }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [dbOptions, setDbOptions] = React.useState<any[]>([]);
  const [resolvedUrl, setResolvedUrl] = React.useState(url);

  React.useEffect(() => {
    if (typeof window !== "undefined" && url.includes("undefined")) {
      setResolvedUrl(url.replace("undefined", window.location.origin));
    } else {
      setResolvedUrl(url);
    }
  }, [url]);

  React.useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings();
      if (res.success && res.data?.shareOptions) {
        setDbOptions(res.data.shareOptions);
      }
    }
    fetchSettings();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resolvedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`,
      bgClass:
        "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + resolvedUrl)}`,
      bgClass:
        "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(resolvedUrl)}&title=${encodeURIComponent(title)}${text ? `&summary=${encodeURIComponent(text)}` : ""}`,
      bgClass:
        "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50",
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      href: `https://www.instagram.com/`,
      bgClass:
        "bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50",
    },
  ];

  const customLinks = dbOptions.map((opt) => ({
    name: opt.platform,
    icon: opt.icon ? (
      <div
        dangerouslySetInnerHTML={{ __html: opt.icon }}
        className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4 fill-current currentColor"
      />
    ) : (
      <Share2 className="h-4 w-4" />
    ),
    href: `${opt.baseUrl}${encodeURIComponent(resolvedUrl)}`,
    bgClass:
      "bg-muted text-muted-foreground hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground",
  }));

  // Prevent duplicate keys by filtering out default links that exist in custom links
  const customLinkNames = new Set(
    customLinks.map((link) => link.name.toLowerCase()),
  );
  const filteredDefaultLinks = defaultLinks.filter(
    (link) => !customLinkNames.has(link.name.toLowerCase()),
  );

  const shareLinks = [...filteredDefaultLinks, ...customLinks];

  return (
    /* Fixed: Added overflow-hidden and min-w-0 to constrain flex children */
    <div className="flex flex-col gap-4 py-4 w-full min-w-0 overflow-hidden">
      {/* Top Section: Image and Text */}
      {image && (
        <div className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30 overflow-hidden w-full">
          <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
            <Image src={image} alt={title} fill className="object-cover" />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{title}</span>
            {text && (
              <span className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Middle Section: Horizontally Scrollable Share Buttons */}
      {/* Ensure the parent's overflow-hidden allows this overflow-x-auto to trigger properly */}
      <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 shrink-0 w-24 transition-colors ${link.bgClass}`}
          >
            {link.icon}
            <span className="text-xs font-medium truncate w-full text-center">
              {link.name}
            </span>
          </a>
        ))}
      </div>

      {/* Bottom Section: Copy Link */}
      <div className="flex items-center space-x-2 w-full">
        <div className="grid flex-1 gap-2 min-w-0">
          <input
            id="link"
            value={resolvedUrl}
            readOnly
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 truncate"
          />
        </div>
        <Button size="sm" className="px-3 shrink-0" onClick={handleCopyLink}>
          <span className="sr-only">Copy</span>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
