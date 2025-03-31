import {
  CheckIcon,
  ChevronDown,
  type LucideIcon,
  PlusIcon,
  WandSparkles,
} from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface MultiSelectProps extends React.ComponentPropsWithRef<"button"> {
  options: {
    label: string;
    value: string;
    icon?: LucideIcon;
  }[];

  onCreateItem?: (label: string, setSearch: (value: string) => void) => void;

  value: string[];
  onValueChange: (value: string[]) => void;

  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
}

function MultiSelect({
  ref,
  options,
  onCreateItem,
  onValueChange,
  value,
  defaultValue = [],
  placeholder = "Select options",
  animation = 0,
  maxCount = 3,
  modalPopover = false,
  asChild = false,
  className,
  ...props
}: MultiSelectProps) {
  const [search, setSearch] = React.useState("");

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") setIsPopoverOpen(true);
    else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...value];
      newSelectedValues.pop();

      onValueChange(newSelectedValues);
    }
  };

  const toggleOption = (option: string) => {
    const newSelectedValues = value.includes(option)
      ? value.filter((value) => value !== option)
      : [...value, option];

    onValueChange(newSelectedValues);
  };

  const handleClear = () => {
    onValueChange([]);
  };

  const handleTogglePopover = () => {
    setIsPopoverOpen((prev) => !prev);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      modal={modalPopover}
    >
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          {...props}
          onClick={handleTogglePopover}
          variant="outline"
          className={cn(
            "flex h-auto min-h-9 w-full min-w-0 p-1 dark:bg-input/30",
            className,
          )}
        >
          {value.length > 0 ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-nowrap items-center gap-1">
                {value.slice(0, maxCount).map((raw) => {
                  const option = options.find((o) => o.value === raw);
                  const IconComponent = option?.icon;

                  return (
                    <Badge
                      key={raw}
                      className={cn(isAnimating ? "animate-bounce" : "")}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {IconComponent && (
                        <IconComponent className="mr-2 size-4" />
                      )}

                      {option?.label}
                    </Badge>
                  );
                })}

                {value.length > maxCount && (
                  <Badge
                    className={cn(
                      "border-foreground/1 bg-transparent text-foreground hover:bg-transparent",
                      isAnimating ? "animate-bounce" : "",
                    )}
                    style={{ animationDuration: `${animation}s` }}
                  >
                    {`+ ${value.length - maxCount} more`}
                  </Badge>
                )}
              </div>
              <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
            </div>
          ) : (
            <div className="mx-auto flex w-full items-center justify-between">
              <span className="mx-3 text-muted-foreground text-sm">
                {placeholder}
              </span>
              <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
      >
        <Command>
          <CommandInput
            value={search}
            onValueChange={(value) => setSearch(value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {(options.length > 0 ||
              (onCreateItem && search.trim().length > 0)) && (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex size-4 items-center justify-center rounded-sm border border-input bg-background shadow-sm hover:bg-secondary/20",
                          isSelected
                            ? "bg-secondary/20 text-background"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="size-3" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 size-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}

                {onCreateItem && search.trim().length > 0 && (
                  <CommandItem
                    onSelect={() => onCreateItem(search, setSearch)}
                    className="cursor-pointer"
                  >
                    <PlusIcon className="mr-2 size-4" />
                    <span>Create "{search}"</span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    <CommandItem
                      onSelect={handleClear}
                      className="flex-1 cursor-pointer justify-center"
                    >
                      Clear
                    </CommandItem>
                    <Separator
                      orientation="vertical"
                      className="flex h-full min-h-6"
                    />
                  </div>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
      {animation > 0 && value.length > 0 && (
        <WandSparkles
          className={cn(
            "my-2 h-3 w-3 cursor-pointer bg-background text-foreground",
            isAnimating ? "" : "text-muted-foreground",
          )}
          onClick={() => setIsAnimating(!isAnimating)}
        />
      )}
    </Popover>
  );
}

export { MultiSelect };
