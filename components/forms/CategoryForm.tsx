"use client";

import { updateCategory, createCategory } from "@/actions/category.actions";
import { deleteImageFromImageKit } from "@/actions/imagekit.actions";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { toast } from "sonner";
import Image from "next/image";

import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";

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

export default function CategoryForm({
  initialData,
  onSuccess,
}: {
  initialData?: CategoryInput & { _id: string }; // 👈 Accept existing data
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  // If we have initialData, the slug was already edited, so we don't auto-generate
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState(!!initialData);

  // 2. Populate default values if initialData exists
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      coverImage: "",
    },
  });

  // 1. AUTO-SLUG LOGIC
  const title = form.watch("title");

  useEffect(() => {
    // If the user hasn't manually changed the slug, auto-generate it from the title
    if (title && !isSlugManuallyEdited) {
      const generatedSlug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, isSlugManuallyEdited, form]);

  // 2. IMAGE UPLOAD LOGIC
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Compressing and uploading image...");

    // Delete old image if it exists
    const oldImage = form.getValues("coverImage");
    if (oldImage && oldImage.includes("ik.imagekit.io")) {
      await deleteImageFromImageKit(oldImage).catch(console.error);
    }

    // Call your custom helper, explicitly passing "category" as the destination
    const result = await compressAndUploadImage(file, "category");

    if (result.success && result.url) {
      form.setValue("coverImage", result.url, { shouldValidate: true });
      toast.success("Image uploaded successfully!", { id: loadingToast });
    } else {
      toast.error(result.error || "Failed to upload image", {
        id: loadingToast,
      });
    }

    setIsUploading(false);
  };

  // 3. SUBMIT LOGIC
  const onSubmit = (values: CategoryInput) => {
    startTransition(async () => {
      let response;

      // Decide which Server Action to call
      if (initialData) {
        response = await updateCategory(initialData._id, values);
      } else {
        response = await createCategory(values);
      }

      if (response.error) {
        toast.error(response.error);
      } else if (response.success) {
        toast.success(response.message);
        if (!initialData) form.reset(); // Only reset if creating new
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Artificial Intelligence"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="artificial-intelligence"
                  disabled={isPending}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsSlugManuallyEdited(true); // Stop auto-generating if they type here
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Articles related to AI and Machine Learning..."
                  className="resize-none"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CUSTOM IMAGE UPLOAD FIELD */}
        <FormItem>
          <FormLabel>Cover Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isPending}
            />
          </FormControl>
          {/* Image Preview */}
          {form.watch("coverImage") && (
            <div className="mt-4 relative h-40 w-full rounded-md overflow-hidden border">
              <Image
                src={form.watch("coverImage")}
                alt="Cover preview"
                fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <FormMessage>{form.formState.errors.coverImage?.message}</FormMessage>
        </FormItem>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || isUploading}
        >
          {isPending
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
              ? "Update Category"
              : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
