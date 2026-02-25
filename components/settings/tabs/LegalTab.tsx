"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface LegalTabProps {
  form: UseFormReturn<any>;
}

export default function LegalTab({ form }: LegalTabProps) {
  return (
    <div className="space-y-6">
      {/* About Us Section */}
      <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold">"Who We Are" Content</h3>
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
                <Textarea
                  placeholder="Share a bit about your team or mission..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Keep it concise. HTML tags like &lt;br&gt;, &lt;b&gt;, and
                &lt;i&gt; are supported.
              </FormDescription>
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
                <Textarea
                  placeholder="Enter your privacy policy content here..."
                  className="min-h-[200px] font-mono text-sm"
                  {...field}
                />
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
                <Textarea
                  placeholder="Enter your terms and conditions here..."
                  className="min-h-[200px] font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
