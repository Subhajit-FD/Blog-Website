"use client";

import { UseFormReturn } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

interface AnimationsTabProps {
  form: UseFormReturn<any>;
}

const animationOptions = [
  {
    name: "animations.global" as const,
    label: "Global Animations",
    description: "Master switch — disabling this turns off all effects below.",
  },
  {
    name: "animations.loader" as const,
    label: "Splash Screen",
    description: "Initial loading animation shown on first visit.",
  },
  {
    name: "animations.pageTransition" as const,
    label: "Page Transitions",
    description: "Smooth slide-in effect when navigating between routes.",
  },
  {
    name: "animations.textHighlight" as const,
    label: "Text Highlights",
    description: "Scroll-triggered text reveal effects on headings.",
  },
];

export default function AnimationsTab({ form }: AnimationsTabProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
      <div>
        <h3 className="text-lg font-bold">Animation &amp; Effects</h3>
        <p className="text-sm text-muted-foreground">
          Toggle global or individual animation features across the site.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {animationOptions.map((opt) => (
          <FormField
            key={opt.name}
            control={form.control}
            name={opt.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{opt.label}</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
