"use server";

import { serverClient } from "@/lib/trpc/serverClient";

export async function submitCalculation(formData: FormData) {
	const numberA = Number.parseFloat(formData.get("numberA") as string);
	const numberB = Number.parseFloat(formData.get("numberB") as string);

	// check if the numbers are valid
	if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
		throw new Error("Invalid numbers");
	}

	try {
		// create jobs
		const result = await serverClient.worker.createJobs.mutate({
			number_a: numberA,
			number_b: numberB,
		});

		if (!result) {
			throw new Error("Failed to create jobs");
		}

		// Trigger the worker for each specific job
		for (const job of result) {
			const res = await serverClient.worker.jobRunner.mutate({ jobId: job.id });
			if (!res) {
				throw new Error("Failed to run job");
			}
		}

		return { success: true };
	} catch (err) {
		console.error(err);
		throw new Error("Failed to submit calculations", { cause: err });
	}
}
