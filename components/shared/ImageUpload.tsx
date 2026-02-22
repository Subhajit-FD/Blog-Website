"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { deleteImageFromImageKit } from "@/actions/imagekit.actions";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  compressAndUploadImage,
  ImageFolderDestination,
} from "@/lib/helpers/image-upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: ImageFolderDestination;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "user-profile",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      if (value && value.includes("ik.imagekit.io")) {
        await deleteImageFromImageKit(value);
      }

      const res = await compressAndUploadImage(file, folder);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(res.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Something went wrong during upload");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (value && value.includes("ik.imagekit.io")) {
      deleteImageFromImageKit(value).catch(console.error);
    }
    onChange("");
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="flex items-center gap-6">
        {/* Preview Area */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 group">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : value ? (
            <>
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                onClick={handleRemove}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
              >
                <X className="w-6 h-6" />
              </div>
            </>
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="outline"
              onClick={triggerUpload}
              disabled={isUploading}
              className="w-fit"
            >
              {isUploading
                ? "Uploading..."
                : value
                  ? "Change Image"
                  : "Upload Image"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, max 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
