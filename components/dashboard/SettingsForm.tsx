"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { settingsSchema, SettingsInput } from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings.actions";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";
import { PERMISSIONS } from "@/lib/config/permissions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical } from "lucide-react";

export default function SettingsForm({
  initialData,
  userPermissions,
}: {
  initialData: any;
  userPermissions: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Check if they hold the master admin bit
  const isAdmin = (userPermissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  const defaultValues = {
    siteName: initialData?.siteName || "",
    faviconUrl: initialData?.faviconUrl || "",
    appleTouchIconUrl: initialData?.appleTouchIconUrl || "",
    logoUrl: initialData?.logoUrl || "",
    siteDescription: initialData?.siteDescription || "",
    seoTitle: initialData?.seoTitle || "",
    seoImage: initialData?.seoImage || "",
    socialLinks: initialData?.socialLinks || [],
    shareOptions: initialData?.shareOptions || [],
    animations: {
      global: initialData?.animations?.global ?? true,
      loader: initialData?.animations?.loader ?? true,
      pageTransition: initialData?.animations?.pageTransition ?? true,
      textHighlight: initialData?.animations?.textHighlight ?? true,
    },
  };

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultValues as any,
  });

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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "logoUrl" | "faviconUrl" | "appleTouchIconUrl" | "seoImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingId = toast.loading(`Uploading ${fieldName}...`);

    const result = await compressAndUploadImage(file, "site");

    if (result.success && result.url) {
      form.setValue(fieldName, result.url, { shouldValidate: true });
      toast.success("Image uploaded successfully!", { id: loadingId });
    } else {
      toast.error(result.error || "Upload failed", { id: loadingId });
    }

    setIsUploading(false);
  };

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await updateSettings(values);
      if (res.error) toast.error(res.error);
      else toast.success(res.message);
    });
  };

  const logoUrlValue = form.watch("logoUrl");
  const faviconUrlValue = form.watch("faviconUrl");
  const appleTouchIconUrlValue = form.watch("appleTouchIconUrl");
  const seoImageValue = form.watch("seoImage");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-4xl"
      >
        {/* BASIC SETTINGS */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <div>
            <h3 className="text-lg font-bold">General Information</h3>
            <p className="text-sm text-muted-foreground">
              Basic branding and configuration.
            </p>
          </div>

          <FormField
            control={form.control}
            name="siteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SOCIAL LINKS */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Social Links</h3>
              <p className="text-sm text-muted-foreground">
                Manage your social media presence.
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
                        <FormLabel className="text-xs">
                          Title (e.g. Twitter)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Platform Name" {...field} />
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
                          <Input placeholder="https://..." {...field} />
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
                            SVG Icon Code (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='<svg>...</svg> or path d="..."'
                              className="font-mono text-xs"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-[10px] text-muted-foreground">
                            Paste raw SVG code or a valid SVG path.
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
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

        {/* DYNAMIC SHARE OPTIONS */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Dynamic Share Options</h3>
              <p className="text-sm text-muted-foreground">
                Manage options available in the Share Dialog. (Copy Link is
                always included).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendShare({ platform: "", baseUrl: "", icon: "" })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Add Share Option
            </Button>
          </div>

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
                        <FormLabel className="text-xs">
                          Platform (e.g. LinkedIn)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Platform Name" {...field} />
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
                        <FormLabel className="text-xs">
                          Base Settings URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://twitter.com/intent/tweet?url="
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          The share URL base. The actual post URL will be
                          appended.
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
                            SVG Icon Code (Required)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='<svg>...</svg> or path d="..."'
                              className="font-mono text-xs"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-[10px] text-muted-foreground">
                            Paste raw SVG code or a valid SVG path to display in
                            the modal.
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                  onClick={() => removeShare(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {shareFields.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                No custom share options configured. Only Copy Link will be
                shown.
              </div>
            )}
          </div>
        </div>

        {/* SEO & BRANDING SETTINGS: Strictly Admins Only */}
        {isAdmin && (
          <div className="space-y-4 bg-card p-6 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              ADMIN ONLY
            </div>

            <h3 className="text-lg font-bold">SEO & Core Branding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              High-impact settings that affect search engines.
            </p>
            <Separator className="mb-4" />

            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title tag displayed in search results..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Global Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Used by Google for the homepage..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>SEO Open Graph Image (Social Share Image)</FormLabel>
              <div className="flex items-center gap-6">
                {seoImageValue && (
                  <div className="relative w-32 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image
                      src={seoImageValue as string}
                      alt="SEO Graph Image"
                      fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover p-1"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "seoImage")}
                  disabled={isUploading || isPending}
                />
              </div>
              <FormMessage />
            </FormItem>
          </div>
        )}

        {/* WEBSITE VISUALS: Admins Only */}
        {isAdmin && (
          <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary w-2 h-full"></div>
            <div>
              <h3 className="text-lg font-bold">Website Visuals</h3>
              <p className="text-sm text-muted-foreground">
                Manage logos and icons applied to the browser tab and app UI.
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormItem>
                <FormLabel>Site Logo</FormLabel>
                <div className="flex flex-col gap-3">
                  {logoUrlValue && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                      <Image
                        src={logoUrlValue as string}
                        alt="Logo"
                        fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logoUrl")}
                    disabled={isUploading || isPending}
                  />
                </div>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Favicon (Browser Tab)</FormLabel>
                <div className="flex flex-col gap-3">
                  {faviconUrlValue && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                      <Image
                        src={faviconUrlValue as string}
                        alt="Favicon"
                        fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "faviconUrl")}
                    disabled={isUploading || isPending}
                  />
                </div>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Apple Touch Icon</FormLabel>
                <div className="flex flex-col gap-3">
                  {appleTouchIconUrlValue && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border bg-muted shrink-0">
                      <Image
                        src={appleTouchIconUrlValue as string}
                        alt="Touch Icon"
                        fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover p-1"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "appleTouchIconUrl")}
                    disabled={isUploading || isPending}
                  />
                </div>
                <FormMessage />
              </FormItem>
            </div>
          </div>
        )}

        {/* ANIMATION SETTINGS */}
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <div>
            <h3 className="text-lg font-bold">Animation & Effects</h3>
            <p className="text-sm text-muted-foreground">
              Toggle global or individual animation features across the site.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="animations.global"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Global Animations
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Master switch for all animations.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animations.loader"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Splash Screen</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Initial loading animation on visit.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animations.pageTransition"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Page Transitions
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Smooth slide between routes.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animations.textHighlight"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Text Highlights</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Scroll-triggered text reveal effects.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="w-full md:w-auto"
        >
          {isPending ? "Saving configuration..." : "Save Global Settings"}
        </Button>
      </form>
    </Form>
  );
}
