import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import { MultiSelect } from "~/components/multi-select";
import { Input } from "~/components/ui/input";
import type { clientLoader } from "../route";
import { searchParams } from "../search-params";

export function Filters() {
  const navigate = useNavigate();

  const { tags: tagOptions } = useLoaderData<typeof clientLoader>();

  const [params, setSearchParams] = useQueryStates(searchParams);
  const [debounced] = useDebounce(params, 500);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    navigate({
      pathname: location.pathname,
      search: location.search,
    });
  }, [debounced]);

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-60 text-sm"
        placeholder="Search..."
        value={params.search}
        onChange={async (event) => {
          setSearchParams({ tags: params.tags, search: event.target.value });
        }}
      />
      <MultiSelect
        className="h-8 min-h-8 w-60 text-sm"
        placeholder="Search by tags..."
        maxCount={2}
        value={params.tags.map((tag) => tag.toString())}
        onValueChange={async (value) => {
          setSearchParams({
            tags: value.map(Number),
            search: params.search,
          });
        }}
        options={tagOptions.map((tag) => ({
          label: tag.name,
          value: tag.id.toString(),
        }))}
      />
    </div>
  );
}
