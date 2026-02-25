"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray } from "react-hook-form";
import { Trash2, Plus, GripVertical, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SocialTabProps {
  form: UseFormReturn<any>;
}

// Ready-to-use share API endpoints — the post URL is appended to the end
const SHARE_PRESETS = [
  {
    platform: "Facebook",
    baseUrl: "https://www.facebook.com/sharer/sharer.php?u=",
  },
  { platform: "Twitter/X", baseUrl: "https://twitter.com/intent/tweet?url=" },
  {
    platform: "LinkedIn",
    baseUrl: "https://www.linkedin.com/shareArticle?mini=true&url=",
  },
  { platform: "WhatsApp", baseUrl: "https://api.whatsapp.com/send?text=" },
  { platform: "Telegram", baseUrl: "https://t.me/share/url?url=" },
  { platform: "Reddit", baseUrl: "https://www.reddit.com/submit?url=" },
  {
    platform: "Pinterest",
    baseUrl: "https://pinterest.com/pin/create/button/?url=",
  },
  { platform: "Email", baseUrl: "mailto:?body=" },
];

export default function SocialTab({ form }: SocialTabProps) {
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });
  const {
    fields: shareFields,
    append: appendShare,
    remove: removeShare,
  } = useFieldArray({
    control: form.control,
    name: "shareOptions",
  });

  const addPreset = (preset: (typeof SHARE_PRESETS)[0]) => {
    appendShare({
      platform: preset.platform,
      baseUrl: preset.baseUrl,
      icon: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Social Links ── */}
      <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Social Links</h3>
            <p className="text-sm text-muted-foreground">
              Shown in the footer Connect section.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSocial({ title: "", url: "", icon: "" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Button>
        </div>
        <div className="space-y-4">
          {socialFields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-4 items-start p-4 border rounded-lg bg-muted/50"
            >
              <div className="mt-3 text-muted-foreground">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Platform Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Twitter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://twitter.com/youraccount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          SVG Icon (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='<svg>...</svg> or path d="..."'
                            className="font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground">
                          Paste raw SVG or a path d value.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 mt-1"
                onClick={() => removeSocial(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {socialFields.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              No social links added yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Share Options ── */}
      <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Dynamic Share Options</h3>
            <p className="text-sm text-muted-foreground">
              Buttons shown in the Share Dialog on each post. "Copy Link" is
              always included automatically.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendShare({ platform: "", baseUrl: "", icon: "" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Option
          </Button>
        </div>

        {/* How it works */}
        <div className="flex gap-2 text-[12px] text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>How "Base Share URL" works:</strong> The current post URL
              is URL-encoded and appended directly to the end of whatever you
              enter here.
            </p>
            <p>
              ✅ &nbsp;Correct:{" "}
              <code className="bg-muted px-1 rounded">
                https://www.facebook.com/sharer/sharer.php?u=
              </code>
            </p>
            <p>
              ❌ &nbsp;Wrong:{" "}
              <code className="bg-muted px-1 rounded">
                https://facebook.com
              </code>{" "}
              — missing the sharing endpoint and query parameter.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {SHARE_PRESETS.map((preset) => (
              <Button
                key={preset.platform}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addPreset(preset)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {preset.platform}
              </Button>
            ))}
          </div>
        </div>

        {/* Reference table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-3 py-2 font-semibold">Platform</th>
                <th className="text-left px-3 py-2 font-semibold">
                  Base Share URL to use
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {SHARE_PRESETS.map((p) => (
                <tr
                  key={p.platform}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {p.platform}
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[11px] text-muted-foreground break-all">
                      {p.baseUrl}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator />

        {/* Field array */}
        <div className="space-y-4">
          {shareFields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-4 items-start p-4 border rounded-lg bg-muted/50"
            >
              <div className="mt-3 text-muted-foreground">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`shareOptions.${index}.platform`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Platform Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`shareOptions.${index}.baseUrl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Base Share URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.facebook.com/sharer/sharer.php?u="
                          className="font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground">
                        Must end with the query param (e.g. <code>?u=</code> or{" "}
                        <code>?text=</code>). The post URL is appended
                        automatically.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`shareOptions.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          SVG Icon (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='<svg>...</svg> or path d="..."'
                            className="font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 mt-1"
                onClick={() => removeShare(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {shareFields.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
              No share options configured. Use "Quick Add" above or add
              manually.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
