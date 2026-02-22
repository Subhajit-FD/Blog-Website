"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createRole, updateRole } from "@/actions/role.actions";
import { PERMISSIONS } from "@/lib/config/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define schema
const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  permissions: z.number().min(0),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: {
    _id: string;
    name: string;
    description?: string;
    permissions: number;
  };
}

export default function RoleForm({ initialData }: RoleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      permissions: initialData?.permissions || 0,
    },
  });

  const onSubmit = (values: RoleFormValues) => {
    startTransition(async () => {
      let res;
      const validT = { ...values, description: values.description || "" };
      if (initialData) {
        res = await updateRole(initialData._id, validT);
      } else {
        res = await createRole(validT);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(initialData ? "Role updated!" : "Role created!");
        router.push("/dashboard/roles");
        router.refresh();
      }
    });
  };

  // Helper to toggle a specific permission bit
  const togglePermission = (bitValue: number, currentPermissions: number) => {
    // If bit is set, XOR it to remove. If not set, OR it to add.
    if ((currentPermissions & bitValue) !== 0) {
      return currentPermissions ^ bitValue; // Remove
    } else {
      return currentPermissions | bitValue; // Add
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Role" : "Create New Role"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Moderator" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What do users with this role do?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Permissions</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/50">
                  {Object.entries(PERMISSIONS).map(([key, value]) => {
                    // Exclude internal bitwise helpers if any. Keys are strings.
                    if (typeof value !== "number") return null;

                    const isChecked =
                      (form.getValues("permissions") & value) !== 0;

                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={isChecked}
                          onCheckedChange={() => {
                            const current = form.getValues("permissions");
                            const next = togglePermission(value, current);
                            form.setValue("permissions", next, {
                              shouldDirty: true,
                            });
                          }}
                        />
                        <label
                          htmlFor={key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {key.replace(/_/g, " ")}
                        </label>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined Permission Value: {form.watch("permissions")}
                </p>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : initialData
                    ? "Update Role"
                    : "Create Role"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
