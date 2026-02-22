"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { toast } from "sonner";
import { compressAndUploadImage } from "@/lib/helpers/image-upload";

import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Underline from "@tiptap/extension-underline"; // 👈 Import Underline extension

import {
  Bold,
  Italic,
  Underline as UnderlineIcon, // 👈 Import Icon
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  Quote,
  List,
  ListOrdered,
  ImageIcon,
  Link as LinkIcon,
  X,
  Minus, // 👈 Import Separator Icon
} from "lucide-react";
import { useState } from "react";

interface TiptapProps {
  content: string;
  onChange: (richText: string) => void;
}

// 👈 Helper Component for Tooltip Buttons
function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={isActive}
            onPressedChange={onClick}
            aria-label={label}
          >
            <Icon className="w-4 h-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Tiptap({ content, onChange }: TiptapProps) {
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline, // 👈 Add Underline Extension
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4 border",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer",
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert m-5 focus:outline-none min-h-[400px]",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML()); // Sends the HTML string back to React Hook Form
    },
  });

  if (!editor) return null;

  // CUSTOM IMAGE UPLOAD HANDLER FOR TIPTAP
  const addTiptapImage = async () => {
    // 1. Create a hidden file input element on the fly
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const loadingId = toast.loading("Uploading image into post...");

      // 2. Upload to the "blog" folder in ImageKit
      const result = await compressAndUploadImage(file, "blog");

      // 3. Insert the ImageKit URL into the editor
      if (result.success && result.url) {
        editor.chain().focus().setImage({ src: result.url }).run();
        toast.success("Image embedded!", { id: loadingId });
      } else {
        toast.error("Failed to upload image.", { id: loadingId });
      }
    };
    input.click();
  };

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setIsLinkDialogOpen(true);
  };

  const saveLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setIsLinkDialogOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsLinkDialogOpen(false);
  };

  return (
    <div className="flex flex-col border rounded-md overflow-hidden bg-card shadow-sm">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 border-b p-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive("paragraph")}
          icon={Pilcrow}
          label="Paragraph"
        />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          label="Heading 2"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          label="Heading 3"
        />
        {/* Skipping H4-H6 for brevity unless explicitly requested, 
            but usually H1-H3 are enough. 
            User didn't ask to remove them, so I should probably keep them or 
            group them. I'll stick to original H1-H6 but wrapped.
        */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          isActive={editor.isActive("heading", { level: 4 })}
          icon={Heading4}
          label="Heading 4"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          isActive={editor.isActive("heading", { level: 5 })}
          icon={Heading5}
          label="Heading 5"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          isActive={editor.isActive("heading", { level: 6 })}
          icon={Heading6}
          label="Heading 6"
        />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          label="Italic"
        />
        {/* 👈 New Underline Button */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={UnderlineIcon}
          label="Underline"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          label="Blockquote"
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* 👈 New Separator Button */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false} // HR doesn't have an active state usually
          icon={Minus}
          label="Separator"
        />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          label="Ordered List"
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* LINK DIALOG TRIGGER */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("link")}
                    onPressedChange={openLinkDialog}
                    aria-label="Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Toggle>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <Input
                  id="link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              {editor.isActive("link") && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeLink}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Link
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsLinkDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" onClick={saveLink}>
                  Save
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={false}
                onPressedChange={addTiptapImage}
                aria-label="Upload Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* THE ACTUAL EDITOR AREA */}
      <div className="p-4 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
