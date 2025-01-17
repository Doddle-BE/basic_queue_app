import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { DB_JOB_STATUS } from "@/types";
import * as openai from "@/lib/openai";
import type { Job } from "@/types";

export const calculationsRouter = router({
  // Process a calculation job
  processJob: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let job: Job | null = null;

      try {
        // Get the specific job
        const { data: fetchedJob } = await ctx.supabase
          .from("jobs")
          .select()
          .eq("id", input.jobId)
          .single();

        job = fetchedJob;

        if (!job) {
          throw new Error("Job not found");
        }

        // Mark job as processing
        await ctx.supabase
          .from("jobs")
          .update({ status: DB_JOB_STATUS.PROCESSING })
          .eq("id", job.id);

        // Simulate processing time (3 seconds)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Calculate result
        const result = await openai.doCalculation({
          number_a: job.number_a,
          number_b: job.number_b,
          operation: job.operation,
        });

        console.log("Job completed:", {
          operation: job.operation,
          result,
          status: DB_JOB_STATUS.COMPLETED,
        });

        // Update job with result
        await ctx.supabase
          .from("jobs")
          .update({
            status: DB_JOB_STATUS.COMPLETED,
            result,
          })
          .eq("id", job.id);

        return { message: "Job completed", result };
      } catch (error) {
        console.error("Worker error:", error);

        // If we have a job ID, mark it as failed
        if (job?.id) {
          await ctx.supabase
            .from("jobs")
            .update({
              status: DB_JOB_STATUS.FAILED,
              result: null,
            })
            .eq("id", job.id);
        }

        throw new Error("Job processing failed");
      }
    }),

  // Get job updates
  getJobUpdates: publicProcedure
    .input(
      z.object({
        jobIds: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      console.log("Polling for jobs:", input.jobIds);
      const { data: jobs, error } = await ctx.supabase
        .from("jobs")
        .select()
        .in("id", input.jobIds);

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log("Found jobs:", jobs);
      return (
        jobs?.map((job) => ({
          operation: job.operation,
          result: job.result,
          status: job.status,
          id: job.id,
        })) || []
      );
    }),
});
