"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import type React from "react";
import { useState } from "react";
import { trpc } from "./client";

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: unstable_httpSubscriptionLink({
            url: "http://localhost:3001",
          }),
          false: httpBatchLink({
            url: "http://localhost:3001",
          }),
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
