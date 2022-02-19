import { QueryObserver } from "react-query/core";

import type { UseBaseQueryOptions, UseQueryResult } from "react-query/types";

import { createEffect, onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { useQueryClient } from "./QueryClientProvider";

export type UseQueryReturnType<
  TData,
  TError,
  Result = UseQueryResult<TData, TError>
> = Readonly<Result>;

export function useBaseQuery<TQueryFnData, TError, TData, TQueryData>(
  options: UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryData>,
  Observer: typeof QueryObserver
): UseQueryReturnType<TData, TError> {
  const queryClient = useQueryClient();
  const defaultedOptions = queryClient.defaultQueryObserverOptions(options);
  const observer = new Observer(queryClient, defaultedOptions);
  const [state, setState] = createStore(observer.getCurrentResult());

  createEffect(() => {
    observer.setOptions(queryClient.defaultQueryObserverOptions(options));
  });

  const unsubscribe = observer.subscribe((result) => {
    setState(reconcile(result));
  });

  onCleanup(() => unsubscribe());

  return state;
}
