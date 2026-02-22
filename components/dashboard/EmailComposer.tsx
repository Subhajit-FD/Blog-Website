"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { sendStaffEmail } from "@/actions/email.actions";
import { emailSchema, EmailInput } from "@/lib/validations/email";
import Tiptap from "@/components/editor/Tiptap";

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
import { Send } from "lucide-react";

export default function EmailComposer() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { to: "", subject: "", body: "" },
  });

  const onSubmit = (values: EmailInput) => {
    startTransition(async () => {
      const res = await sendStaffEmail(values.to, values.subject, values.body);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Email sent successfully!");
        form.reset();
      }
    });
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Important Update: Project Status"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Body</FormLabel>
                <FormControl>
                  <Tiptap content={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            <Send className="w-4 h-4 mr-2" />
            {isPending ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
