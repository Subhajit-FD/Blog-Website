"use client";

import dynamic from "next/dynamic";
import { UseFormReturn } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const Tiptap = dynamic(() => import("@/components/editor/Tiptap"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full flex items-center justify-center bg-muted rounded-md border text-muted-foreground animate-pulse text-sm">
      Loading Editor...
    </div>
  ),
});

interface LegalTabProps {
  form: UseFormReturn<any>;
}

export default function LegalTab({ form }: LegalTabProps) {
  return (
    <div className="space-y-6">
      {/* About Us Section */}
      <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold">&quot;Who We Are&quot; Content</h3>
          <p className="text-sm text-muted-foreground">
            This content appears in the accordion at the bottom of the footer.
          </p>
        </div>
        <Separator />
        <FormField
          control={form.control}
          name="aboutUs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Us Brief</FormLabel>
              <FormControl>
                <Tiptap content={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Legal Pages Section */}
      <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Legal Pages Content</h3>
          <p className="text-sm text-muted-foreground">
            Full content for your Privacy Policy and Terms of Service pages.
          </p>
        </div>
        <Separator />

        <FormField
          control={form.control}
          name="privacyContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy Policy</FormLabel>
              <FormControl>
                <Tiptap content={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms of Service</FormLabel>
              <FormControl>
                <Tiptap content={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
