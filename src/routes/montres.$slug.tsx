import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/montres/$slug")({
  loader: ({ params }) => {
    throw redirect({
      to: "/produits/$slug",
      params: { slug: params.slug },
      statusCode: 308,
    });
  },
});
