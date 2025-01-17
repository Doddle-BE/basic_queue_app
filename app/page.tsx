"use client";

import { submitCalculation } from "@/app/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSSE } from "@/lib/hooks/custom-hooks";
import { CalculationResults, JOB_STATUS } from "@/types";
import Form from "next/form";
import React from "react";
import { flushSync } from "react-dom";

export default function AppForm() {
  const { messages } = useSSE("/api/progress");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<CalculationResults>({
    sum: { result: null, status: JOB_STATUS.IDLE },
    difference: { result: null, status: JOB_STATUS.IDLE },
    product: { result: null, status: JOB_STATUS.IDLE },
    division: { result: null, status: JOB_STATUS.IDLE },
  });

  // Calculate progress based on completed results
  const progress = React.useMemo(() => {
    const completedCount = Object.values(results).filter(
      (r) => r.status === JOB_STATUS.COMPLETED
    ).length;
    return completedCount * 25;
    // It's not necessary to include the "results"-object in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    results.sum.status,
    results.difference.status,
    results.product.status,
    results.division.status,
  ]);

  React.useEffect(() => {
    if (Object.keys(messages).length > 0) {
      setResults((prev) => {
        return {
          ...prev,
          ...messages,
        };
      });
    }
  }, [messages]);

  async function handleSubmit(formData: FormData) {
    try {
      // flushSync is used to ensure that results are updated before they will be changed again by the SSE
      // use flushSync with caution, it can cause performance issues if not used properly
      flushSync(() => {
        setResults((prev) => ({
          ...prev,
          sum: { result: null, status: JOB_STATUS.COMPUTING },
          difference: { result: null, status: JOB_STATUS.COMPUTING },
          product: { result: null, status: JOB_STATUS.COMPUTING },
          division: { result: null, status: JOB_STATUS.COMPUTING },
        }));
        setIsLoading(true);
        setError(null);
      });

      await submitCalculation(formData);
    } catch (err) {
      setError("Failed to submit calculations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8 pt-12">
        <Form action={handleSubmit}>
          <div className="flex gap-8 items-center justify-center">
            <Input
              placeholder="Enter number A"
              type="number"
              className="w-48"
              name="numberA"
              required
              disabled={isLoading}
            />
            <Input
              placeholder="Enter number B"
              type="number"
              className="w-48"
              name="numberB"
              required
              disabled={isLoading}
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Computing..." : "Compute"}
            </Button>
          </div>
        </Form>

        {error && <div className="text-red-500 text-center">{error}</div>}

        {(progress > 0 ||
          results.sum.status === "computing" ||
          results.difference.status === "computing" ||
          results.product.status === "computing" ||
          results.division.status === "computing") && (
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center text-sm text-gray-600">
              Computing... {Math.floor(progress / 25)} out of 4 jobs finished
            </div>

            <Progress value={progress} className="h-2 w-96 mx-auto" />

            {/* Results box. Prevents layout shift when results are computed */}
            <div className="flex justify-center">
              <div className="space-y-2 text-left pt-4 p-4 min-w-fit font-mono">
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A + B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.sum.status === "computing"
                      ? "Computing..."
                      : results.sum.result}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A - B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.difference.status === "computing"
                      ? "Computing..."
                      : results.difference.result}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A * B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.product.status === "computing"
                      ? "Computing..."
                      : results.product.result}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A / B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.division.status === "computing"
                      ? "Computing..."
                      : results.division.result}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
