import { QueryClient } from "react-query/core";
import { Component, Switch, Match } from "solid-js";
import { useQuery } from "./solid-query/useQuery";
import { QueryClientProvider } from "./solid-query/QueryClientProvider";
import { Repository } from "./types";
import styles from "./App.module.css";

const fetcher = (): Promise<Repository> => {
  return fetch(
    "https://api.github.com/repos/tannerlinsley/react-query"
  ).then((res) => res.json());
};

const RepoDetails: Component = () => {
  const state = useQuery("repo-info", fetcher, {
    refetchInterval: 60000
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
        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={() => state.refetch()} disabled={state.isFetching}>
            {state.isFetching ? "Refetching..." : "Refetch"}
          </button>
        </div>
      </Match>
    </Switch>
  );
};

const client = new QueryClient();

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
