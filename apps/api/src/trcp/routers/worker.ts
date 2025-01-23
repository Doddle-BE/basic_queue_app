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
			let job: Job | null = null;
			const { jobId } = input;

			const { data: fetchedJob } = await supabase
				.from("jobs")
				.select()
				.eq("id", jobId)
				.single();

			if (!fetchedJob) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Job not found",
				});
			}

			await supabase
				.from("jobs")
				.update({ status: DB_JOB_STATUS.PROCESSING })
				.eq("id", jobId);

			await new Promise((resolve) => setTimeout(resolve, 3000));

			job = fetchedJob;

			const result = await openai.doCalculation({
				number_a: job.number_a,
				number_b: job.number_b,
				operation: job.operation,
			});

			await supabase
				.from("jobs")
				.update({ status: DB_JOB_STATUS.COMPLETED, result })
				.eq("id", jobId);

			return { message: "Job completed", result };
		}),
});
