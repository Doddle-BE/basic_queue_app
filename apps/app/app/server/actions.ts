"use server";

import { serverClient } from "@/lib/trpc/serverClient";

export async function submitCalculation(formData: FormData) {
  const numberA = Number.parseFloat(formData.get("numberA") as string);
  const numberB = Number.parseFloat(formData.get("numberB") as string);

  // check if the numbers are valid
  if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
    throw new Error("Invalid numbers");
  }

  // create jobs
  const result = await serverClient.worker.createJobs.mutate({
    number_a: numberA,
    number_b: numberB,
  });

  // Trigger the worker for each specific job
  for (const job of result) {
    const res = await serverClient.worker.jobRunner.mutate({ jobId: job.id });
    console.log(res);
  }

  return { success: true };
}
