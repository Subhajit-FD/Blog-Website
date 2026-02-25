"use client";

import { UseFormReturn } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PERMISSIONS } from "@/lib/config/permissions";

interface GeneralTabProps {
  form: UseFormReturn<any>;
  userPermissions: number;
  isUploading: boolean;
  isPending: boolean;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl" | "appleTouchIconUrl" | "seoImage",
  ) => void;
}

export default function GeneralTab({
  form,
  userPermissions,
  isUploading,
  isPending,
  onImageUpload,
}: GeneralTabProps) {
  const isAdmin = (userPermissions & PERMISSIONS.ADMINISTRATOR) !== 0;
  const logoUrlValue = form.watch("logoUrl");
  const faviconUrlValue = form.watch("faviconUrl");
  const appleTouchIconUrlValue = form.watch("appleTouchIconUrl");

  return (
    <div className="space-y-6">
      {/* Site Name */}
      <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold">General Information</h3>
          <p className="text-sm text-muted-foreground">
            Basic branding and site identity.
          </p>
        </div>
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Blog" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Website Visuals — Admin Only */}
      {isAdmin && (
        <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            ADMIN ONLY
          </div>
          <div>
            <h3 className="text-lg font-bold">Website Visuals</h3>
            <p className="text-sm text-muted-foreground">
              Manage logos and icons applied to the browser tab and app UI.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Logo */}
            <FormItem>
              <FormLabel>Site Logo</FormLabel>
              <div className="flex flex-col gap-3">
                {logoUrlValue && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={logoUrlValue}
                      alt="Logo"
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, "logoUrl")}
                  disabled={isUploading || isPending}
                />
              </div>
            </FormItem>

            {/* Favicon */}
            <FormItem>
              <FormLabel>Favicon (Browser Tab)</FormLabel>
              <div className="flex flex-col gap-3">
                {faviconUrlValue && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={faviconUrlValue}
                      alt="Favicon"
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, "faviconUrl")}
                  disabled={isUploading || isPending}
                />
              </div>
            </FormItem>

            {/* Apple Touch Icon */}
            <FormItem>
              <FormLabel>Apple Touch Icon</FormLabel>
              <div className="flex flex-col gap-3">
                {appleTouchIconUrlValue && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={appleTouchIconUrlValue}
                      alt="Touch Icon"
                      fill
                      sizes="56px"
                      className="object-cover p-1"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, "appleTouchIconUrl")}
                  disabled={isUploading || isPending}
                />
              </div>
            </FormItem>
          </div>
        </div>
      )}
    </div>
  );
}
