import { zodResolver } from "@hookform/resolvers/zod";
import { and, desc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { db } from "~/database/.client";
import { type boards, columns } from "~/database/.client/schema";

const formSchema = z.object({
  title: z
    .string({ message: "You must provide a string." })
    .trim()
    .min(4, { message: "It must be at least 4 characters." }),
});

export function CreateColumnDialog({
  board,
}: {
  board: typeof boards.$inferSelect;
}) {
  const revalidator = useRevalidator();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const [existingColumn] = await db
      .select({ name: columns.title })
      .from(columns)
      .where(and(eq(columns.boardId, board.id), eq(columns.title, data.title)))
      .limit(1);

    if (existingColumn) {
      form.setError("title", {
        message: "You already have a column with this name.",
      });

      return;
    }

    const [lastColumn] = await db
      .select({ rank: columns.rank })
      .from(columns)
      .where(eq(columns.boardId, board.id))
      .orderBy(desc(columns.rank))
      .limit(1);

    const [column] = await db
      .insert(columns)
      .values({
        boardId: board.id,
        title: data.title,
        rank: generateKeyBetween(lastColumn?.rank, null),
      })
      .returning({ id: columns.id });

    if (!column) {
      toast.error("Something went wrong, please try again.");
      return;
    }

    await revalidator.revalidate();

    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="min-h-9 w-full cursor-pointer rounded-sm text-muted-foreground"
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Create Column</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Column</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new column to organize your issues.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's the title of your column?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
