import { DB_JOB_STATUS, type Job, JOB_STATUS } from "@shared/types";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { supabase } from "../../supabase/supabase";
import { publicProcedure, router } from "../trcp";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

export const progressRouter = router({
	getProgress: publicProcedure.query(async ({ ctx }) => {
		const { data, error } = await supabase
			.from("jobs")
			.select("*")
			.returns<Job[]>();

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
							try {
								if (payload.new.status === DB_JOB_STATUS.COMPLETED) {
									emit.next({
										[payload.new.operation]: {
											result: payload.new.result,
											status: JOB_STATUS.COMPLETED,
										},
									});
								}
							} catch (error) {
								emit.error(
									error instanceof Error
										? error
										: new Error("Subscription error"),
								);
							}
						},
					)
					.subscribe((status, error) => {
						if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
							emit.error(
								error instanceof Error
									? error
									: new Error("Subscription error"),
							);
						}
					});

				const timeout = setTimeout(() => {
					emit.error(new Error("Subscription timeout"));
					channel.unsubscribe();
				}, 30000); // 30s timeout

				// Cleanup function
				return () => {
					clearTimeout(timeout);
					channel.unsubscribe();
				};
			},
		);
	}),
});
