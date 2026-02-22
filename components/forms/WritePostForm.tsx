"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";

import { postSchema, PostInput } from "@/lib/validations/post";
import { createPost, updatePost } from "@/actions/post.actions";
import { deleteImageFromImageKit } from "@/actions/imagekit.actions";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";
import dynamic from "next/dynamic";
const Tiptap = dynamic(() => import("@/components/editor/Tiptap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-md border text-muted-foreground animate-pulse">
      Loading Editor...
    </div>
  ),
});

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WritePostFormProps {
  categories: { _id: string; title: string; slug: string }[];
  teams: { _id: string; name: string }[];
  initialData?: Omit<PostInput, "status" | "displayTags"> & {
    _id: string;
    status?: string;
    displayTags?: string[];
  };
}

export default function WritePostForm({
  categories,
  teams,
  initialData,
}: WritePostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState(!!initialData);

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      coverImage: initialData?.coverImage || "",
      coverImageAlt: initialData?.coverImageAlt || "",
      category: initialData?.category || "",
      teamId: initialData?.teamId || "none",
      tags: initialData?.tags || [],
      status: (initialData?.status as any) || "DRAFT",
      displayTags: (initialData?.displayTags as any) || [],
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt)
        : undefined,
    },
  });

  const status = form.watch("status");

  useEffect(() => {
    form.setValue("tags", tags);
  }, [tags, form]);

  const title = form.watch("title");
  const content = form.watch("content");
  const coverImage = form.watch("coverImage");
  const selectedCategoryId = form.watch("category");

  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      const generatedSlug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, isSlugManuallyEdited, form]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content || coverImage) {
        const formData = form.getValues();
        const previewData = {
          ...formData,
          categoryTitle: categories.find((c) => c._id === formData.category)
            ?.title,
        };
        localStorage.setItem("blog-live-preview", JSON.stringify(previewData));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, coverImage, selectedCategoryId, categories, form]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading cover image...");

    // Delete old cover image if it exists and is an ImageKit URL
    const oldImage = form.getValues("coverImage");
    if (oldImage && oldImage.includes("ik.imagekit.io")) {
      await deleteImageFromImageKit(oldImage).catch(console.error);
    }

    const result = await compressAndUploadImage(file, "blog");

    if (result.success && result.url) {
      form.setValue("coverImage", result.url, { shouldValidate: true });
      toast.success("Cover image uploaded!", { id: loadingToast });
    } else {
      toast.error(result.error || "Upload failed", { id: loadingToast });
    }

    setIsUploading(false);
  };

  const onSubmit = (values: PostInput) => {
    // Basic validation before submission if status is SCHEDULED
    if (values.status === "SCHEDULED" && !values.publishedAt) {
      toast.error("Please select a date and time for scheduled posts.");
      return;
    }

    const finalValues = { ...values };
    if (finalValues.teamId === "none" || finalValues.teamId === "") {
      finalValues.teamId = undefined;
    }

    startTransition(async () => {
      let response;

      if (initialData) {
        response = await updatePost(initialData._id, finalValues);
      } else {
        response = await createPost(finalValues);
      }

      if (response.error) {
        toast.error(response.error);
      } else if (response.success) {
        toast.success(response.message);
        router.push("/dashboard/posts");
      }
    });
  };

  const displayTagOptions = ["Editor Choice", "Trending", "Popular"] as const;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)]">
      <ScrollArea className="pr-4 pb-10 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">
                {initialData ? "Edit Post" : "Write Post"}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full xl:w-auto">
                {/* Scheduled Date Picker */}
                {status === "SCHEDULED" && (
                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve time if modifying date
                                  const currentValue =
                                    field.value || new Date();
                                  date.setHours(currentValue.getHours());
                                  date.setMinutes(currentValue.getMinutes());
                                  field.onChange(date);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="time"
                                  className="h-8"
                                  value={
                                    field.value
                                      ? format(field.value, "HH:mm")
                                      : ""
                                  }
                                  onChange={(e) => {
                                    if (!e.target.value) return;
                                    const [hours, minutes] = e.target.value
                                      .split(":")
                                      .map(Number);
                                    const newDate = field.value || new Date(); // Use existing or new date
                                    // If it's a new date (field.value was null), Calendar might not have been picked yet.
                                    // Logic: Users pick date first usually.
                                    // We should handle if value is null, default to today.
                                    const dateToSet = new Date(newDate);
                                    dateToSet.setHours(hours);
                                    dateToSet.setMinutes(minutes);
                                    field.onChange(dateToSet);
                                  }}
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Save as Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Publish Now</SelectItem>
                          <SelectItem value="SCHEDULED">Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const formData = form.getValues();
                      const previewData = {
                        ...formData,
                        categoryTitle: categories.find(
                          (c) => c._id === formData.category,
                        )?.title,
                      };
                      localStorage.setItem(
                        "blog-live-preview",
                        JSON.stringify(previewData),
                      );
                      window.open("/preview/post", "_blank");
                    }}
                    disabled={isPending || isUploading}
                  >
                    Live Preview
                  </Button>
                  <Button type="submit" disabled={isPending || isUploading}>
                    {isPending
                      ? initialData
                        ? "Updating..."
                        : "Saving..."
                      : initialData
                        ? "Update Post"
                        : "Save Post"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="The Future of AI..."
                        className="text-lg font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="the-future-of-ai"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setIsSlugManuallyEdited(true);
                          }}
                          onBlur={(e) => {
                            const trimmed = e.target.value.trim();
                            const safeSlug = slugify(trimmed, {
                              lower: true,
                              strict: true,
                            });
                            field.onChange(safeSlug);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Team (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Personal (No Team)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            Personal (No Team)
                          </SelectItem>
                          {teams?.map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief summary for Google search results..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display Tags Section */}
              <div className="space-y-3 pt-2">
                <FormLabel>Display Options</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {displayTagOptions.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="displayTags"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        item,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {item}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormDescription>
                  Boost visibility in specific sections of the layout.
                </FormDescription>
              </div>

              <div className="space-y-2">
                <FormLabel>Tags (SEO Keywords)</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newTags = tags.filter((_, i) => i !== index);
                          setTags(newTags);
                        }}
                        className="text-muted-foreground hover:text-destructive focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter or Comma to add)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const newTag = tagInput.trim();
                      if (newTag && !tags.includes(newTag)) {
                        setTags([...tags, newTag]);
                        setTagInput("");
                      }
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  These tags will be used as meta keywords for SEO.
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploading || isPending}
                    className="w-full"
                  />
                  {isUploading && (
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Uploading...
                    </span>
                  )}
                </div>
                <FormMessage>
                  {form.formState.errors.coverImage?.message}
                </FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="coverImageAlt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Alt Tag (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe the image for screen readers..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel className="font-semibold text-lg block">
                Blog Content
              </FormLabel>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Tiptap content={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
}
