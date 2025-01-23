import { z } from "zod";
import { publicProcedure, router } from "../trcp";
import {
	JOB_OPERATION,
	type JobOperationType,
	type Job,
	DB_JOB_STATUS,
} from "@shared/types";
import { TRPCError } from "@trpc/server";
import * as openai from "@/openai/openai";
import { supabase } from "@/supabase/supabase";

// Create all four calculations as separate jobs
const operations: JobOperationType[] = [
	JOB_OPERATION.SUM,
	JOB_OPERATION.DIFFERENCE,
	JOB_OPERATION.PRODUCT,
	JOB_OPERATION.DIVISION,
];

export const workerRouter = router({
	createJobs: publicProcedure
		.input(
			z.object({
				number_a: z.number(),
				number_b: z.number(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { number_a, number_b } = input;

			if (Number.isNaN(number_a) || Number.isNaN(number_b)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid numbers",
				});
			}

			const { data, error } = await supabase
				.from("jobs")
				.insert(
					operations.map((operation) => ({
						operation,
						number_a,
						number_b,
						status: DB_JOB_STATUS.PENDING,
					})),
				)
				.select();

			if (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating jobs",
					cause: error,
				});
			}

			return data;
		}),
	jobRunner: publicProcedure
		.input(
			z.object({
				jobId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { jobId } = input;

			try {
				const { data: fetchedJob, error: fetchError } = await supabase
					.from("jobs")
					.select()
					.eq("id", jobId)
					.single();

				if (fetchError || !fetchedJob) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Job not found",
					});
				}
				if (fetchedJob.status !== DB_JOB_STATUS.PENDING) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Job already ${fetchedJob.status.toLowerCase()}`,
					});
				}

				const { error: updateError } = await supabase
					.from("jobs")
					.update({ status: DB_JOB_STATUS.PROCESSING })
					.eq("id", jobId);

				if (updateError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update job status",
					});
				}

				await new Promise((resolve) => setTimeout(resolve, 3000));

				let result: Awaited<ReturnType<typeof openai.doCalculation>>;
				try {
					result = await openai.doCalculation({
						number_a: fetchedJob.number_a,
						number_b: fetchedJob.number_b,
						operation: fetchedJob.operation,
					});
				} catch (error) {
					await supabase
						.from("jobs")
						.update({ status: DB_JOB_STATUS.FAILED })
						.eq("id", jobId);

					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Calculation failed",
						cause: error,
					});
				}

				const { error: finalUpdateError } = await supabase
					.from("jobs")
					.update({ status: DB_JOB_STATUS.COMPLETED, result })
					.eq("id", jobId);

				if (finalUpdateError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update job result",
					});
				}

				return { message: "Job completed", result };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unknown error occurred",
					cause: error,
				});
			}
		}),
});
