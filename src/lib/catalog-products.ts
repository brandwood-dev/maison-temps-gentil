import { getRouteApi } from "@tanstack/react-router";

const rootRoute = getRouteApi("__root__");

export function useCatalogProducts() {
  return rootRoute.useLoaderData().products;
}

export function useCatalogCategories() {
  return rootRoute.useLoaderData().categories;
}

export function useCatalogAttributes() {
  return rootRoute.useLoaderData().attributes;
}
