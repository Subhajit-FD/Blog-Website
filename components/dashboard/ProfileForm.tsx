"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { profileSchema, ProfileInput } from "@/lib/validations/user";
import { updateUserProfile } from "@/actions/user.actions";
import { deleteImageFromImageKit } from "@/actions/imagekit.actions";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const { update } = useSession(); // To update the NextAuth session locally
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      image: user?.image || "",
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingId = toast.loading("Uploading profile picture...");

    // Delete old avatar if it exists and is an ImageKit URL
    const oldImage = form.getValues("image");
    if (oldImage && oldImage.includes("ik.imagekit.io")) {
      await deleteImageFromImageKit(oldImage).catch(console.error);
    }

    // 👈 Notice the strict "user-profile" destination!
    const result = await compressAndUploadImage(file, "user-profile");

    if (result.success && result.url) {
      form.setValue("image", result.url, { shouldValidate: true });
      toast.success("Profile picture updated!", { id: loadingId });
    } else {
      toast.error(result.error || "Upload failed", { id: loadingId });
    }

    setIsUploading(false);
  };

  const imageValue = form.watch("image");
  const nameValue = form.watch("name");

  const onSubmit = (values: ProfileInput) => {
    startTransition(async () => {
      const res = await updateUserProfile(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        await update({ name: values.name, image: values.image }); // Update session state
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl"
      >
        {/* Avatar Upload Area */}
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24 border shadow-sm">
            <AvatarImage
              src={imageValue}
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
              {nameValue?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <FormLabel className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Change Picture"}
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading || isPending}
              />
            </FormLabel>
            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size of 5MB.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <Input
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Contact an Admin to change your email address.
            </p>
          </FormItem>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending || isUploading}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
