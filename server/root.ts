import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { calculationsRouter } from "./routers/calculations";

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.name ?? "world"}!`,
      };
    }),
  calculations: calculationsRouter,
});

export type AppRouter = typeof appRouter;
