import { zodResolver } from "@hookform/resolvers/zod";
import { and, eq, inArray } from "drizzle-orm";
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
import { issueTags, issues, tags } from "~/database/.client/schema";
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

export function UpdateIssueDialog({
  issue,
  open,
  setOpen,
}: {
  issue: typeof issues.$inferSelect & {
    tags: (typeof issueTags.$inferSelect)[];
  };
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const revalidator = useRevalidator();
  const { tags: tagOptions } = useLoaderData<typeof clientLoader>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: issue.title,
      description: issue.description ?? "",
      tagIds: issue.tags.map((issueTag) => issueTag.tagId),
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await db
      .update(issues)
      .set({
        title: data.title,
        description: data.description,
      })
      .where(eq(issues.id, issue.id));

    const oldTagIds = issue.tags.map((issueTag) => issueTag.tagId);
    const newTagIds = data.tagIds;

    const tagsToAdd = newTagIds.filter((id) => !oldTagIds.includes(id));
    const tagsToRemove = oldTagIds.filter((id) => !newTagIds.includes(id));

    if (tagsToAdd.length > 0)
      await db.insert(issueTags).values(
        tagsToAdd.map((tagId) => ({
          issueId: issue.id,
          tagId,
        })),
      );

    if (tagsToRemove.length > 0)
      await db
        .delete(issueTags)
        .where(
          and(
            eq(issueTags.issueId, issue.id),
            inArray(issueTags.tagId, tagsToRemove),
          ),
        );

    await revalidator.revalidate();

    setOpen(false);
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
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
