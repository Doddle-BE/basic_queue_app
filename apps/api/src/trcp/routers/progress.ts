import { DB_JOB_STATUS, JOB_STATUS } from "@shared/types";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { supabase } from "../../supabase/supabase";
import { publicProcedure, router } from "../trcp";

export const progressRouter = router({
	getProgress: publicProcedure.query(async ({ ctx }) => {
		const { data, error } = await supabase.from("jobs").select("*");

		if (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch jobs",
				cause: error,
			});
		}

		return data.reduce<Record<string, { result: unknown; status: string }>>(
			(acc, job) => {
				acc[job.operation] = {
					result: job.result,
					status: job.status,
				};
				return acc;
			},
			{},
		);
	}),

	// Stream job updates using SSE
	streamProgress: publicProcedure.subscription(() => {
		return observable<Record<string, { result: unknown; status: string }>>(
			(emit) => {
				const channel = supabase
					.channel("jobs")
					.on(
						"postgres_changes",
						{ event: "UPDATE", schema: "public", table: "jobs" },
						(payload) => {
							if (payload.new.status === DB_JOB_STATUS.COMPLETED) {
								emit.next({
									[payload.new.operation]: {
										result: payload.new.result,
										status: JOB_STATUS.COMPLETED,
									},
								});
							}
						},
					)
					.subscribe();

				// Cleanup function
				return () => {
					channel.unsubscribe();
				};
			},
		);
	}),
});
