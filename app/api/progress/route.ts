import { supabase } from "@/lib/supabase";
import { DB_JOB_STATUS, JOB_STATUS } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) endpoint that streams job completion updates to clients
 *
 * This endpoint establishes a real-time connection to Supabase and listens for updates
 * to the "jobs" table. When a job is completed, it sends the result to connected clients
 * using SSE protocol.
 *
 * The function:
 * 1. Creates a Supabase channel subscription for the "jobs" table
 * 2. Listens specifically for UPDATE events where status becomes "completed"
 * 3. Streams results back to the client as SSE messages
 * 4. Properly handles connection cleanup on cancel
 *
 * @returns {Response} A streaming response with appropriate SSE headers
 */
export async function GET() {
  let channel: RealtimeChannel;
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      channel = supabase
        .channel("jobs")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "jobs" },
          (payload) => {
            if (payload.new.status === DB_JOB_STATUS.COMPLETED) {
              // The double newline sequence (\n\n) is the standard delimiter that tells the client where one SSE message ends and the next begins.
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    [payload.new.operation]: {
                      result: payload.new.result,
                      status: JOB_STATUS.COMPLETED,
                    },
                  })}\n\n`
                )
              );
            }
          }
        )
        .subscribe();
    },
    cancel() {
      if (channel) {
        channel.unsubscribe();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
