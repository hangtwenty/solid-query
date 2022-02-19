import { QueryClient } from "react-query/core";
import { Component, Switch, Match, createSignal } from "solid-js";
import { useQuery } from "./solid-query/useQuery";
import { useMutation } from "./solid-query/useMutation";
import { QueryClientProvider } from "./solid-query/QueryClientProvider";

import { Repository } from "./types";
import styles from "./App.module.css";

let errorRate = 0.05;

let QUERY_TIME_MIN = 100;
let QUERY_TIME_MAX = 300;
let mutationCount = 0;

const fetcher = (): Promise<Repository> => {
  return fetch("https://api.github.com/repos/tannerlinsley/react-query").then(
    (resp) => {
      const result = resp.json();
      result.mutation_count = mutationCount; // HACK just for testing
      return result;
    }
  );
};

const client = new QueryClient();

function demoMutate(data, queryTimeMin, queryTimeMax) {
  console.info("demoMutate", data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        return reject(new Error("fake error"));
      }
      mutationCount++;
      data = {
        ...data,
        subscribers_count: data.subscribers_count + 1,
        stargazers_count: data.stargazers_count + 1,
        forks_count: data.forks_count + 1,
        mutation_count: mutationCount
      };
      console.log({ data });
      resolve(data);
    }, queryTimeMin + Math.random() * (queryTimeMax - queryTimeMin));
  });
}

const RepoDetails: Component = () => {
  const [queryTimeMin, setQueryTimeMin] = createSignal(QUERY_TIME_MIN);
  const [queryTimeMax, setQueryTimeMax] = createSignal(QUERY_TIME_MAX);

  const state = useQuery("repo-info", fetcher, {
    refetchInterval: 60000
  });

  const contrivedMutation = useMutation(demoMutate, {
    onSuccess: (data) => {
      // client.invalidateQueries("repo-info");
      client.setQueryData("repo-info", data);
      // console.log("repo-info", client.getQueryData("repo-info"));
    }
  });

  return (
    <Switch fallback={<div>No repo found</div>}>
      <Match when={state.isLoading}>
        <div>Loading...</div>
      </Match>
      <Match when={state.isError}>
        <div>An error has occurred</div>
      </Match>
      <Match when={state.data && state.data.id}>
        <h1>{state.data.name} with Solid</h1>
        <p>{state.data.description}</p>
        <strong>👀 {state.data.subscribers_count}</strong>
        <strong>✨ {state.data.stargazers_count}</strong>
        <strong>🍴 {state.data.forks_count}</strong>
        <strong>... mut: {state.data?.mutation_count || 0}</strong>
        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={() => state.refetch()} disabled={state.isFetching}>
            {state.isFetching ? "Refetching..." : "Refetch"}
          </button>
          <button
            onClick={() =>
              contrivedMutation.mutate(state.data, queryTimeMin, queryTimeMax)
            }
            disabled={state.isFetching}
          >
            {state.isFetching ? "Refetching..." : "Mutation example"}
          </button>
          <br />
          <input
            type="checkbox"
            checked={true}
            onInput={(ev) => {
              let value = ev.target.checked;
              if (value) {
                setQueryTimeMax(QUERY_TIME_MAX);
                setQueryTimeMin(QUERY_TIME_MIN);
              } else {
                setQueryTimeMax(0);
                setQueryTimeMin(0);
              }
            }}
          />
          <span>
            Fake latency: {queryTimeMin()}ms - {queryTimeMax()}ms
          </span>
        </div>
      </Match>
    </Switch>
  );
};

const App: Component = () => {
  return (
    <QueryClientProvider client={client}>
      <div class={styles.App}>
        <RepoDetails />
      </div>
    </QueryClientProvider>
  );
};

export default App;
function useSignal(arg0: (x: any) => any): [any, any] {
  throw new Error("Function not implemented.");
}
