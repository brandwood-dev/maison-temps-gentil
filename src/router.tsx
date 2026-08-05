import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Keep intent preloads reusable during a short navigation burst. A zero
    // stale time caused every hover/navigation pair to refetch the same route.
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
