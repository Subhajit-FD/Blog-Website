"use client";

import { useState, useTransition } from "react";
import { createTeam } from "@/actions/team.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CreateTeamForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Team name is required");

    startTransition(async () => {
      const res = await createTeam(name);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setName("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Team Name
        </label>
        <Input
          id="name"
          placeholder="e.g. Content Creators"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Create Team
      </Button>
    </form>
  );
}
