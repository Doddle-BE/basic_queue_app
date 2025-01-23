import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { createContext } from "./context";
import { progressRouter } from "./routers/progress";
import { workerRouter } from "./routers/worker";
import { router } from "./trcp";
import dotenv from "dotenv";

dotenv.config();

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

server.listen(process.env.PORT || 5000);
console.log(`Server is running on port ${process.env.PORT || 5000}`);
