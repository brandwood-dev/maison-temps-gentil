import { getRouteApi } from "@tanstack/react-router";

const rootRoute = getRouteApi("__root__");

export function useCatalogProducts() {
  return rootRoute.useLoaderData().products;
}
