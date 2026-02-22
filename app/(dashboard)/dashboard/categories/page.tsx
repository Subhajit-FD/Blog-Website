"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { getCategories, deleteCategory } from "@/actions/category.actions";
import CategoryForm from "@/components/forms/CategoryForm";
import DeleteDialog from "@/components/shared/DeleteDialog"; // 👈 Import our new wrapper

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = useCallback(async () => {
    const res = await getCategories();
    if (res.success) setCategories(res.data);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Notice: This is now an async function that returns a Promise,
  // so the DeleteDialog knows exactly when to stop spinning.
  const handleDelete = async (id: string) => {
    const res = await deleteCategory(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      await fetchCategories();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage the core topics of your blog.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>+ New Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={fetchCategories} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col"
          >
            <div className="h-32 relative bg-muted">
              {category.coverImage && (
                <Image
                  src={category.coverImage}
                  alt={category.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="p-4 flex-1">
              <h3 className="font-bold text-lg">{category.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                /{category.slug}
              </p>
              <p className="text-sm line-clamp-2">{category.description}</p>
            </div>

            <div className="p-4 border-t bg-muted/50 flex justify-end gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                  </DialogHeader>
                  <CategoryForm
                    initialData={category}
                    onSuccess={fetchCategories}
                  />
                </DialogContent>
              </Dialog>

              {/* 👈 OUR NEW REUSABLE WRAPPER IN ACTION */}
              <DeleteDialog
                title={category.title}
                expectedText={category.title} // User must type the category title to delete
                onConfirm={() => handleDelete(category._id)}
                trigger={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                }
              />
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
            No categories found. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
