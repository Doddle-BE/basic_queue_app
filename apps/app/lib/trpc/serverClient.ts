import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api";

export const serverClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3001",
    }),
  ],
});
