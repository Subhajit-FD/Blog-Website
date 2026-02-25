"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SettingsInput, settingsSchema } from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings.actions";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Search, Share2, Zap, FileText, Save } from "lucide-react";

import GeneralTab from "./tabs/GeneralTab";
import SeoTab from "./tabs/SeoTab";
import SocialTab from "./tabs/SocialTab";
import AnimationsTab from "./tabs/AnimationsTab";
import LegalTab from "./tabs/LegalTab";

interface SiteSettingsFormProps {
  initialData: any;
  userPermissions: number;
}

export default function SiteSettingsForm({
  initialData,
  userPermissions,
}: SiteSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      siteName: initialData?.siteName || "",
      faviconUrl: initialData?.faviconUrl || "",
      appleTouchIconUrl: initialData?.appleTouchIconUrl || "",
      logoUrl: initialData?.logoUrl || "",
      siteDescription: initialData?.siteDescription || "",
      seoTitle: initialData?.seoTitle || "",
      seoImage: initialData?.seoImage || "",
      keywords: initialData?.keywords || "",
      twitterHandle: initialData?.twitterHandle || "",
      socialLinks: (initialData?.socialLinks || []) as any,
      shareOptions: (initialData?.shareOptions || []) as any,
      animations: {
        global: initialData?.animations?.global ?? true,
        loader: initialData?.animations?.loader ?? true,
        pageTransition: initialData?.animations?.pageTransition ?? true,
        textHighlight: initialData?.animations?.textHighlight ?? true,
      },
      aboutUs: initialData?.aboutUs || "",
      termsContent: initialData?.termsContent || "",
      privacyContent: initialData?.privacyContent || "",
      customTags: (initialData?.customTags || []) as any,
    } as any,
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "logoUrl" | "faviconUrl" | "appleTouchIconUrl" | "seoImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingId = toast.loading(`Uploading ${fieldName}...`);

    try {
      const result = await compressAndUploadImage(file, "site");
      if (result.success && result.url) {
        form.setValue(fieldName, result.url, { shouldValidate: true });
        toast.success("Image uploaded successfully!", { id: loadingId });
      } else {
        toast.error(result.error || "Upload failed", { id: loadingId });
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: loadingId });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: any) => {
    startTransition(async () => {
      try {
        const res = await updateSettings(values);
        if (res.success) {
          toast.success(res.message || "Settings updated successfully");
        } else {
          toast.error(res.error || "Failed to update settings");
        }
      } catch (error) {
        toast.error("Failed to update settings");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20  py-4 border-b">
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="w-full md:w-auto shadow-lg"
          >
            {isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Settings2 className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="animations" className="gap-2">
              <Zap className="w-4 h-4" />
              Animations
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2">
              <FileText className="w-4 h-4" />
              Legal & About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 outline-none">
            <GeneralTab
              form={form}
              userPermissions={userPermissions}
              isUploading={isUploading}
              isPending={isPending}
              onImageUpload={handleImageUpload}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 outline-none">
            <SeoTab
              form={form}
              userPermissions={userPermissions}
              isUploading={isUploading}
              isPending={isPending}
              onImageUpload={handleImageUpload}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6 outline-none">
            <SocialTab form={form} />
          </TabsContent>

          <TabsContent value="animations" className="space-y-6 outline-none">
            <AnimationsTab form={form} />
          </TabsContent>

          <TabsContent value="legal" className="space-y-6 outline-none">
            <LegalTab form={form} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
