"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERMISSIONS } from "@/lib/config/permissions";
import {
  Plus,
  Trash2,
  Code2,
  Tag,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface SeoTabProps {
  form: UseFormReturn<any>;
  userPermissions: number;
  isUploading: boolean;
  isPending: boolean;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl" | "appleTouchIconUrl" | "seoImage",
  ) => void;
}

// Preset templates for common tags
const TAG_PRESETS = [
  {
    label: "Google Site Verification",
    tagType: "meta" as const,
    attributes: {
      name: "google-site-verification",
      content: "PASTE_TOKEN_HERE",
    },
    content: "",
    placement: "head" as const,
  },
  {
    label: "Bing Site Verification",
    tagType: "meta" as const,
    attributes: { name: "msvalidate.01", content: "PASTE_TOKEN_HERE" },
    content: "",
    placement: "head" as const,
  },
  {
    label: "Facebook Domain Verification",
    tagType: "meta" as const,
    attributes: {
      name: "facebook-domain-verification",
      content: "PASTE_TOKEN_HERE",
    },
    content: "",
    placement: "head" as const,
  },
  {
    label: "Pinterest Verification",
    tagType: "meta" as const,
    attributes: { name: "p:domain_verify", content: "PASTE_TOKEN_HERE" },
    content: "",
    placement: "head" as const,
  },
  {
    label: "Canonical URL",
    tagType: "link" as const,
    attributes: { rel: "canonical", href: "https://yourdomain.com" },
    content: "",
    placement: "head" as const,
  },
  {
    label: "Custom Inline Script",
    tagType: "script" as const,
    attributes: {},
    content: "// your tracking / analytics code here",
    placement: "head" as const,
  },
];

function TagRow({
  index,
  form,
  remove,
}: {
  index: number;
  form: UseFormReturn<any>;
  remove: (i: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const tagType = form.watch(`customTags.${index}.tagType`);

  // Live attribute editing stored as a JSON string in a textarea
  const attrsValue = form.watch(`customTags.${index}.attributes`) || {};
  const attrsJson = JSON.stringify(attrsValue, null, 2);

  const handleAttrsChange = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      form.setValue(`customTags.${index}.attributes`, parsed, {
        shouldValidate: true,
      });
    } catch {
      // allow intermediate invalid state while typing
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 shrink-0 text-primary" />
          <span className="font-medium text-sm truncate">
            {form.watch(`customTags.${index}.label`) || `Tag #${index + 1}`}
          </span>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {"<"}
            {form.watch(`customTags.${index}.tagType`) || "meta"}
            {">"}
          </Badge>
          <Badge
            variant="secondary"
            className="text-[10px] shrink-0 hidden sm:inline-flex"
          >
            {form.watch(`customTags.${index}.placement`) || "head"}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => remove(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Label */}
            <FormField
              control={form.control}
              name={`customTags.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Google Verification"
                      className="h-8 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tag Type */}
            <FormField
              control={form.control}
              name={`customTags.${index}.tagType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Tag Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="meta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meta">&lt;meta&gt;</SelectItem>
                      <SelectItem value="link">&lt;link&gt;</SelectItem>
                      <SelectItem value="script">&lt;script&gt;</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Placement */}
            <FormField
              control={form.control}
              name={`customTags.${index}.placement`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Placement</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="head" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="head">&lt;head&gt;</SelectItem>
                      <SelectItem value="body">&lt;body&gt; end</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Attributes JSON */}
          <FormItem>
            <FormLabel className="text-xs flex items-center gap-1">
              Attributes
              <span className="text-muted-foreground font-normal">(JSON)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                className="font-mono text-xs resize-none"
                rows={4}
                defaultValue={attrsJson}
                onChange={(e) => handleAttrsChange(e.target.value)}
                placeholder='{ "name": "google-site-verification", "content": "token" }'
              />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              Each key becomes an HTML attribute. E.g.{" "}
              <code className="bg-muted px-1 rounded">
                {"{"}"name": "robots", "content": "index,follow"{"}"}
              </code>
            </p>
          </FormItem>

          {/* Inner Content — only for <script> */}
          {tagType === "script" && (
            <FormField
              control={form.control}
              name={`customTags.${index}.content`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Script Content{" "}
                    <span className="text-muted-foreground font-normal">
                      (inner HTML)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="font-mono text-xs resize-y"
                      rows={5}
                      placeholder="// JavaScript goes here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function SeoTab({
  form,
  userPermissions,
  isUploading,
  isPending,
  onImageUpload,
}: SeoTabProps) {
  const isAdmin = (userPermissions & PERMISSIONS.ADMINISTRATOR) !== 0;
  const seoImageValue = form.watch("seoImage");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customTags",
  });

  const addPreset = (preset: (typeof TAG_PRESETS)[0]) => {
    append({ ...preset });
  };

  const addEmpty = () => {
    append({
      label: "",
      tagType: "meta",
      attributes: {},
      content: "",
      placement: "head",
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <p className="font-medium">Administrator access required</p>
        <p className="text-sm mt-1">
          SEO settings can only be modified by administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Core SEO ── */}
      <div className="space-y-4 bg-card p-6 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          ADMIN ONLY
        </div>
        <h3 className="text-lg font-bold">SEO &amp; Core Branding</h3>
        <p className="text-sm text-muted-foreground">
          These settings directly affect how your site appears in Google and
          social media previews.
        </p>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SEO Title */}
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="BlogZenx — Modern Blogging on Next.js"
                    {...field}
                  />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Shown in browser tab and Google results. Aim for 50–60
                  characters.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Twitter Handle */}
          <FormField
            control={form.control}
            name="twitterHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter / X Handle</FormLabel>
                <FormControl>
                  <Input placeholder="@yourblog" {...field} />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Used for twitter:site meta tag (e.g. @myblog).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Meta Description */}
        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Global Meta Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short, compelling description of your blog (120–160 characters)..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <p className="text-[11px] text-muted-foreground">
                Shown below the title in Google results. Aim for 120–160
                characters.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keywords */}
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input
                  placeholder="blog, nextjs, technology, tutorials"
                  {...field}
                />
              </FormControl>
              <p className="text-[11px] text-muted-foreground">
                Comma-separated keywords. Low direct impact on Google, but
                useful for other engines.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OG Image */}
        <FormItem>
          <FormLabel>Open Graph Image (Social Share Preview)</FormLabel>
          <div className="flex items-center gap-6">
            {seoImageValue && (
              <div className="relative w-40 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                <Image
                  src={seoImageValue}
                  alt="OG Image"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onImageUpload(e, "seoImage")}
                disabled={isUploading || isPending}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Shown when your site is shared on Facebook, Twitter, LinkedIn,
                WhatsApp, etc. Recommended: 1200×630px.
              </p>
            </div>
          </div>
        </FormItem>

        {/* Google Preview */}
        {(form.watch("seoTitle") || form.watch("siteDescription")) && (
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Google Preview
            </p>
            <p className="text-blue-600 text-base font-medium leading-tight truncate">
              {form.watch("seoTitle") || "Page Title"}
            </p>
            <p className="text-green-700 text-xs mt-0.5">
              https://yourdomain.com
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {form.watch("siteDescription") ||
                "Meta description will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* ── Custom Tags ── */}
      <div className="space-y-4 bg-card p-6 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          ADMIN ONLY
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Custom Head / Body Tags
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Inject custom{" "}
              <code className="bg-muted px-1 rounded text-xs">
                &lt;meta&gt;
              </code>
              ,{" "}
              <code className="bg-muted px-1 rounded text-xs">
                &lt;link&gt;
              </code>
              , or{" "}
              <code className="bg-muted px-1 rounded text-xs">
                &lt;script&gt;
              </code>{" "}
              tags directly into your pages — no Google Tag Manager needed.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addEmpty}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tag
          </Button>
        </div>

        {/* Info box */}
        <div className="flex gap-2 text-[12px] text-muted-foreground bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            Tags with <strong>head</strong> placement are injected into{" "}
            <code className="bg-muted px-1 rounded">&lt;head&gt;</code>. Tags
            with <strong>body</strong> placement are injected at the end of{" "}
            <code className="bg-muted px-1 rounded">&lt;body&gt;</code>. Changes
            take effect on the next page refresh after saving.
          </div>
        </div>

        <Separator />

        {/* Quick Presets */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Quick Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {TAG_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addPreset(preset)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tag List */}
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No custom tags yet</p>
            <p className="text-xs mt-1">
              Use a preset above or click "Add Tag" to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <TagRow
                key={field.id}
                index={index}
                form={form}
                remove={remove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
