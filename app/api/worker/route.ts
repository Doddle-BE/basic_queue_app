import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Worker endpoint that processes mathematical calculations asynchronously
 *
 * This endpoint handles individual calculation jobs by:
 * 1. Retrieving the job details from Supabase using the provided job ID
 * 2. Marking the job as "processing"
 * 3. Performing the requested mathematical operation (sum, difference, product, or division)
 * 4. Updating the job status to "completed" with the result
 *
 * The function includes error handling to:
 * - Validate the job ID is provided
 * - Check if the job exists
 * - Handle invalid operations
 * - Mark jobs as "failed" if an error occurs during processing
 *
 * @param request - The incoming HTTP request containing a job ID in the body
 * @returns {Promise<NextResponse>} JSON response with the calculation result or error details
 */
export async function POST(request: Request) {
  let job;

  try {
    // Get the jobId from the request body
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "No job ID provided" },
        { status: 400 }
      );
    }

    // Get the specific job
    const { data: fetchedJob } = await supabase
      .from("jobs")
      .select()
      .eq("id", jobId)
      .single();

    job = fetchedJob;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Mark job as processing
    await supabase
      .from("jobs")
      .update({ status: "processing" })
      .eq("id", job.id);

    // Simulate processing time (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Calculate result
    let result: number;
    switch (job.operation) {
      case "sum":
        result = job.number_a + job.number_b;
        break;
      case "difference":
        result = job.number_a - job.number_b;
        break;
      case "product":
        result = job.number_a * job.number_b;
        break;
      case "division":
        result = job.number_a / job.number_b;
        break;
      default:
        throw new Error("Invalid operation");
    }

    // Update job with result
    await supabase
      .from("jobs")
      .update({
        status: "completed",
        result,
      })
      .eq("id", job.id);

    return NextResponse.json({ message: "Job completed", result });
  } catch (error) {
    console.error("Worker error:", error);

    // If we have a job ID, mark it as failed
    if (job?.id) {
      await supabase
        .from("jobs")
        .update({
          status: "failed",
          result: null,
        })
        .eq("id", job.id);
    }

    return NextResponse.json(
      { error: "Job processing failed" },
      { status: 500 }
    );
  }
}
