import { zodResolver } from "@hookform/resolvers/zod";
import { eq } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/database/.client";
import { boards } from "~/database/.client/schema";

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
});

export function CreateBoardDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const revalidator = useRevalidator();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const [existingBoard] = await db
      .select({ name: boards.title })
      .from(boards)
      .where(eq(boards.title, data.title))
      .limit(1);

    if (existingBoard) {
      form.setError("title", {
        message: "You already have a board with this name.",
      });

      return;
    }

    const [board] = await db
      .insert(boards)
      .values({ title: data.title, description: data.description })
      .returning({ id: boards.id });

    if (!board) {
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
        <Button>
          <PlusIcon className="size-4" />
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new board to organize your projects and issues.
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
                        placeholder="What's the title of your board?"
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
                        placeholder="What's the purpose of this board?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
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
