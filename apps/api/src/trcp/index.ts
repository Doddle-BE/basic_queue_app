import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { createContext } from "./context";
import { progressRouter } from "./routers/progress";
import { workerRouter } from "./routers/worker";
import { router } from "./trcp";

export const appRouter = router({
	worker: workerRouter,
	progress: progressRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
	middleware: cors({
		origin: "*",
		methods: ["GET", "POST", "OPTIONS"],
		allowedHeaders: "*",
	}),
	router: appRouter,
	createContext,
	maxBodySize: Number.POSITIVE_INFINITY,
});

server.listen(3001);
console.log("Server is running on port 3001");
