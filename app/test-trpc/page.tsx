"use client";

import { trpc } from "@/lib/trpc/client";

export default function TestPage() {
  const hello = trpc.hello.useQuery({ name: "TRPC" });

  if (hello.isLoading) return <div>Loading...</div>;
  if (hello.error) return <div>Error: {hello.error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TRPC Test Page</h1>
      <div>{hello.data?.greeting}</div>
    </div>
  );
}
