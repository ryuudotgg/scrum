import { zodResolver } from "@hookform/resolvers/zod";
import { desc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { MultiSelect } from "~/components/multi-select";
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
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/database/.client";
import {
  type columns,
  issueTags,
  issues,
  tags,
} from "~/database/.client/schema";
import type { clientLoader } from "../route";

const formSchema = z.object({
  title: z
    .string({ message: "You must provide a string." })
    .trim()
    .min(4, { message: "It must be at least 4 characters." }),

  description: z
    .string({ message: "You must provide a string." })
    .max(300, { message: "It cannot be more than 300 characters." })
    .transform((s) => {
      const value = s.trim();
      return value === "" ? undefined : value;
    })
    .optional(),

  tagIds: z.array(z.number()),
});

export function CreateIssueDialog({
  column,
  variant = "outline",
}: {
  column: typeof columns.$inferSelect;
  variant?: "ghost" | "outline";
}) {
  const revalidator = useRevalidator();
  const { tags: tagOptions } = useLoaderData<typeof clientLoader>();

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", tagIds: [] },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const [lastIssue] = await db
      .select({ rank: issues.rank })
      .from(issues)
      .where(eq(issues.columnId, column.id))
      .orderBy(desc(issues.rank))
      .limit(1);

    const [issue] = await db
      .insert(issues)
      .values({
        columnId: column.id,
        title: data.title,
        rank: generateKeyBetween(lastIssue?.rank, null),
      })
      .returning({ id: issues.id });

    if (!issue) {
      toast.error("Something went wrong, please try again.");
      return;
    }

    if (data.tagIds.length > 0)
      await db.insert(issueTags).values(
        data.tagIds.map((tagId) => ({
          issueId: issue.id,
          tagId,
        })),
      );

    await revalidator.revalidate();

    setOpen(false);
    form.reset();
  }

  async function onCreateTag(
    label: string,
    setSearch: (value: string) => void,
  ) {
    const [tag] = await db.insert(tags).values({ name: label }).returning();
    if (!tag) {
      toast.error("Something went wrong, please try again.");
      return;
    }

    tagOptions.push(tag);
    form.setValue("tagIds", [...form.getValues("tagIds"), tag.id]);

    setSearch("");

    await revalidator.revalidate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={variant === "ghost" ? "icon" : "default"}
          variant={variant}
          className={
            variant === "ghost"
              ? "size-8 rounded-md"
              : "min-h-9 w-full cursor-pointer rounded-sm text-muted-foreground"
          }
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Create Issue</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new issue to your column.
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
                        placeholder="What's the title of your issue?"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="What's the description of your issue?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagIds"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        maxCount={5}
                        value={value.map(String)}
                        onValueChange={(value) => onChange(value.map(Number))}
                        onCreateItem={(label, setSearch) =>
                          onCreateTag(label, setSearch)
                        }
                        options={tagOptions.map((tag) => ({
                          label: tag.name,
                          value: tag.id.toString(),
                        }))}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
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
