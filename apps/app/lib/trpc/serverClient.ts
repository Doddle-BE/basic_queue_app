import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api";
import { serverUrl } from "../constants";

export const serverClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: serverUrl,
		}),
	],
});
