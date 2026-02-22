"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowUpRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { contactSchema, ContactInput } from "@/lib/validations/contact";
import { submitContactForm } from "@/actions/contact.actions";

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactInput) {
    setIsLoading(true);
    try {
      const res = await submitContactForm({
        name: data.name,
        email: data.email,
        subject: "General Inquiry", // Default subject since field was removed
        message: data.message,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Message sent successfully!");
        form.reset();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          Love to hear from you,
        </h1>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-2">
          Get in touch <span className="text-4xl">👋</span>
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Your name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Edward Snowden"
                      {...field}
                      className="bg-muted/30 border-none h-12 rounded-sm focus-visible:ring-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Your email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="itsexample@gmail.com"
                      {...field}
                      className="bg-muted/30 border-none h-12 rounded-sm focus-visible:ring-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Let tell us know your thoughts"
                    className="bg-muted/30 border-none min-h-[150px] resize-none rounded-sm focus-visible:ring-1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 bg-black hover:bg-gray-800 text-white rounded-none min-w-[150px]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Just Send <ArrowUpRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
