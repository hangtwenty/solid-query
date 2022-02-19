import type {
  QueryFunction,
  QueryKey,
  QueryOptions,
} from "react-query/types";

export function isQueryKey(value: unknown): value is QueryKey {
  return typeof value === "string" || Array.isArray(value);
}

export function parseQueryArgs<TOptions extends QueryOptions<any, any, any>>(
  arg1: QueryKey | TOptions,
  arg2: QueryFunction | TOptions = {} as TOptions,
  arg3: TOptions = {} as TOptions
): TOptions {
  if (!isQueryKey(arg1)) {
    return arg1 as TOptions;
  }

  if (typeof arg2 === "function") {
    return Object.assign(arg3, {
      queryKey: arg1,
      queryFn: arg2,
    }) as TOptions;
  }

  return Object.assign(arg2, { queryKey: arg1 }) as TOptions;
}