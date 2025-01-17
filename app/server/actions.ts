"use server";

import { baseUrl } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { DB_JOB_STATUS, JOB_OPERATION, JobOperationType } from "@/types";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/root";

// Create a tRPC client that can be used in server actions
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
    }),
  ],
});

export async function submitCalculation(formData: FormData) {
  const numberA = parseFloat(formData.get("numberA") as string);
  const numberB = parseFloat(formData.get("numberB") as string);

  // check if the numbers are valid
  if (isNaN(numberA) || isNaN(numberB)) {
    throw new Error("Invalid numbers");
  }

  // Create all four calculations as separate jobs
  const operations: JobOperationType[] = [
    JOB_OPERATION.SUM,
    JOB_OPERATION.DIFFERENCE,
    JOB_OPERATION.PRODUCT,
    JOB_OPERATION.DIVISION,
  ];

  const { data, error } = await supabase
    .from("jobs")
    .insert(
      operations.map((operation) => ({
        operation,
        number_a: numberA,
        number_b: numberB,
        status: DB_JOB_STATUS.PENDING,
      }))
    )
    .select();

  if (error) {
    console.error("Error creating jobs:", error);
    throw error;
  }

  // Get the job IDs
  const jobIds = data.map((job) => job.id);

  // Trigger the worker for each specific job using tRPC
  for (const job of data) {
    await trpc.calculations.processJob.mutate({ jobId: job.id });
  }

  return { success: true, jobIds };
}
