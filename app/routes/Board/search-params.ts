import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs";

export const searchParams = {
  search: parseAsString.withDefault(""),
  tags: parseAsArrayOf(parseAsInteger, ",").withDefault([]),
};

export const loadSearchParams = createLoader(searchParams);
