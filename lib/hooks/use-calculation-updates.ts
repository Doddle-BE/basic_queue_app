"use client";

import { trpc } from "@/lib/trpc/client";
import { CalculationResults, DB_JOB_STATUS, JOB_STATUS } from "@/types";
import { useEffect, useRef, useState } from "react";

// Map database status to client status
function mapStatus(dbStatus: string): keyof typeof JOB_STATUS {
  switch (dbStatus) {
    case DB_JOB_STATUS.COMPLETED:
      return "COMPLETED";
    case DB_JOB_STATUS.PROCESSING:
      return "COMPUTING";
    case DB_JOB_STATUS.FAILED:
      return "ERROR";
    case DB_JOB_STATUS.PENDING:
      return "COMPUTING";
    default:
      return "IDLE";
  }
}

export function useCalculationUpdates() {
  const [results, setResults] = useState<CalculationResults>({
    sum: { result: null, status: JOB_STATUS.IDLE },
    difference: { result: null, status: JOB_STATUS.IDLE },
    product: { result: null, status: JOB_STATUS.IDLE },
    division: { result: null, status: JOB_STATUS.IDLE },
  });

  // Store job IDs for polling
  const jobIdsRef = useRef<string[]>([]);

  // Setup polling for job updates
  const utils = trpc.useUtils();
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobIdsRef.current.length > 0) {
      const pollUpdates = async () => {
        try {
          console.log("Polling with job IDs:", jobIdsRef.current);
          const updates = await utils.client.calculations.getJobUpdates.query({
            jobIds: jobIdsRef.current,
          });
          console.log("Received updates:", updates);

          setResults((prev) => {
            const newResults = { ...prev };
            updates.forEach((update) => {
              const operation = update.operation as keyof CalculationResults;
              const clientStatus = mapStatus(update.status);
              console.log(
                `Mapping status for ${operation}:`,
                update.status,
                "->",
                clientStatus
              );

              newResults[operation] = {
                result: update.result,
                status: JOB_STATUS[clientStatus],
              };
            });
            console.log("New results state:", newResults);
            return newResults;
          });

          // Stop polling if all jobs are completed or failed
          if (
            updates.every((update) =>
              [DB_JOB_STATUS.COMPLETED, DB_JOB_STATUS.FAILED].includes(
                update.status
              )
            )
          ) {
            console.log("All jobs finished, stopping polling");
            clearInterval(intervalId);
            jobIdsRef.current = [];
          }
        } catch (error) {
          console.error("Error polling updates:", error);
        }
      };

      // Poll every second
      intervalId = setInterval(pollUpdates, 1000);
      pollUpdates(); // Initial poll
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [utils]);

  const setComputing = (jobIds: string[]) => {
    console.log("Setting computing state with job IDs:", jobIds);
    jobIdsRef.current = jobIds;
    setResults((prev) => ({
      ...prev,
      sum: { result: null, status: JOB_STATUS.COMPUTING },
      difference: { result: null, status: JOB_STATUS.COMPUTING },
      product: { result: null, status: JOB_STATUS.COMPUTING },
      division: { result: null, status: JOB_STATUS.COMPUTING },
    }));
  };

  return {
    results,
    setComputing,
  };
}
