// Reference -- react-query --
// https://github.com/tannerlinsley/react-query/blob/master/src/react/useMutation.ts
// Reference -- vue-query --
// https://github.com/DamianOsipiuk/vue-query/blob/main/src/vue/useMutation.ts
// Reference -- svelte-query --
// https://github.com/SvelteStack/svelte-query/blob/main/src/mutation/useMutation.ts
import {
  MutationObserverResult,
  notifyManager,
  MutationObserver,
} from 'react-query/core';

import type {
  MutationFunction,
  MutationKey,
  MutationOptions,
} from 'react-query/types/core';
import type {
  UseMutateFunction,
  UseMutationOptions,
  UseMutationResult,
} from 'react-query/types/react';

import {createStore} from 'solid-js/store';
import type {DeepReadonly} from 'solid-js/store';
import {isQueryKey} from './utils';
import {useQueryClient} from './QueryClientProvider';
import {createSignal, onCleanup, onMount} from 'solid-js';

export function parseMutationArgs<TOptions extends MutationOptions<any, any, any, any>>(
  arg1: MutationKey | MutationFunction<any, any> | TOptions,
  arg2?: MutationFunction<any, any> | TOptions,
  arg3?: TOptions,
): TOptions {
  if (isQueryKey(arg1)) {
    if (typeof arg2 === 'function') {
      return {...arg3, mutationKey: arg1, mutationFn: arg2} as TOptions;
    }
    return {...arg2, mutationKey: arg1} as TOptions;
  }

  if (typeof arg1 === 'function') {
    return {...arg2, mutationFn: arg1} as TOptions;
  }

  return {...arg1} as TOptions;
}

// import {shouldThrowError} from 'react-query/lib/core'
export function shouldThrowError(suspense, _useErrorBoundary, error) {
  // Allow useErrorBoundary function to override throwing behavior on a per-error basis
  if (typeof _useErrorBoundary === 'function') {
    return _useErrorBoundary(error);
  } // Allow useErrorBoundary to override suspense's throwing behaviour

  if (typeof _useErrorBoundary === 'boolean') return _useErrorBoundary; // If suspense is enabled default to throwing errors

  return !!suspense;
}

/* Just a noop. it seemed dirtier to import it: import {noop} from 'react-query/types/core/utils'; */
export function noop(): undefined {
  return undefined;
}

// HOOK
export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData | DeepReadonly<TData>, TError | DeepReadonly<TError>, TVariables | DeepReadonly<TVariables>, TContext | DeepReadonly<TContext>>;
export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
): UseMutationResult<TData | DeepReadonly<TData>, TError | DeepReadonly<TError>, TVariables | DeepReadonly<TVariables>, TContext | DeepReadonly<TContext>>;
export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationKey: MutationKey,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey'>,
): UseMutationResult<TData | DeepReadonly<TData>, TError | DeepReadonly<TError>, TVariables | DeepReadonly<TVariables>, TContext | DeepReadonly<TContext>>;
export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationKey: MutationKey,
  mutationFn?: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>,
): UseMutationResult<TData | DeepReadonly<TData>, TError | DeepReadonly<TError>, TVariables | DeepReadonly<TVariables>, TContext | DeepReadonly<TContext>>;
export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  arg1:
    | MutationKey
    | MutationFunction<TData, TVariables>
    | UseMutationOptions<TData, TError, TVariables, TContext>,
  arg2?:
    | MutationFunction<TData, TVariables>
    | UseMutationOptions<TData, TError, TVariables, TContext>,
  arg3?: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData | DeepReadonly<TData>, TError | DeepReadonly<TError>, TVariables | DeepReadonly<TVariables>, TContext | DeepReadonly<TContext>> {
  const options = parseMutationArgs(arg1, arg2, arg3);

  const queryClient = useQueryClient();

  const observer = new MutationObserver(queryClient, options);

  // <TODO(cleanup)>
  // function setOptions(
  //   options: UseMutationOptions<TData, TError, TVariables, TContext>
  // );
  // function setOptions(
  //   mutationKey: MutationKey,
  //   options?: UseMutationOptions<TData, TError, TVariables, TContext>
  // );
  // function setOptions(
  //   mutationKey: MutationKey,
  //   mutationFn?: MutationFunction<TData, TVariables>,
  //   options?: UseMutationOptions<TData, TError, TVariables, TContext>
  // );
  // function setOptions(
  //   mutationFn: MutationFunction<TData, TVariables>,
  //   options?: UseMutationOptions<TData, TError, TVariables, TContext>
  // );
  // function setOptions(
  //   arg1:
  //     | MutationKey
  //     | MutationFunction<TData, TVariables>
  //     | UseMutationOptions<TData, TError, TVariables, TContext>,
  //   arg2?:
  //     | MutationFunction<TData, TVariables>
  //     | UseMutationOptions<TData, TError, TVariables, TContext>,
  //   arg3?: UseMutationOptions<TData, TError, TVariables, TContext>
  // ) {
  //   if (observer.hasListeners()) {
  //     const newOptions = parseMutationArgs(arg1, arg2, arg3);
  //     observer.setOptions(newOptions);
  //   }
  // }
  // </TODO(cleanup)>

  const mutate: UseMutateFunction<TData, TError, TVariables, TContext> = (
    variables,
    mutateOptions,
  ) => {
    observer.mutate(variables, mutateOptions).catch(noop);
  };

  const initialResult = observer.getCurrentResult();
  const initialMutationResult: UseMutationResult<TData,
    TError,
    TVariables,
    TContext> = {
    ...initialResult,
    mutate,
    mutateAsync: initialResult.mutate,
  };

  const [, forceUpdate] = createSignal(0);
  const [state, setState] = createStore(initialMutationResult);

  // Reference -- react-query --
  // https://github.com/tannerlinsley/react-query/blob/master/src/react/useMutation.ts#L91-L107
  onMount(() => {
    // NOTE: I origally did it with createEffect, but I think onMount is more appropriate?
    // setOptions(options);/ / TODO(cleanup): remove if unnecessary
    // observer.setOptions(options); // TODO(cleanup): remove if unnecessary
    observer.subscribe(
      notifyManager.batchCalls(
        (
          result: MutationObserverResult<TData, TError, TVariables, TContext>,
        ) => {
          // "if (observer.hasListeners())" is true if component is still mounted (... or that's the idea ...)
          if (observer.hasListeners()) {
            setState(() => ({
              // Q: Why don't we merge ...state, ...result?
              // A: No need -- we are using a solid.js Store, which does a shallow merge.
              ...result,
            }));
            forceUpdate((x) => x + 1);
          }
        },
      ),
    );
  });

  // onCleanup(()=>{
  //   // FIXME: do we need to do something to clean up after the observer.subscribe() invocation?
  // })

  if (
    state.error &&
    shouldThrowError(undefined, observer.options.useErrorBoundary, state.error)
  ) {
    throw state.error;
  }

  return {
    ...state,
    mutate     : initialMutationResult.mutate,
    mutateAsync: initialMutationResult.mutateAsync,
  };
}
