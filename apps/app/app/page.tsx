"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc/client";
import { type CalculationResults, JOB_STATUS } from "@shared/types";
import Form from "next/form";
import React from "react";
import { flushSync } from "react-dom";
import { CalculationResultRow } from "./components/CalculationResultRow";
import { submitCalculation } from "./server/actions";

export default function AppForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<CalculationResults>({
    sum: { result: null, status: JOB_STATUS.IDLE },
    difference: { result: null, status: JOB_STATUS.IDLE },
    product: { result: null, status: JOB_STATUS.IDLE },
    division: { result: null, status: JOB_STATUS.IDLE },
  });

  // Calculate progress based on completed results
  // biome-ignore lint/correctness/useExhaustiveDependencies: it's not necessary to include the results object in the dependency array
  const progress = React.useMemo(() => {
    const completedCount = Object.values(results).filter(
      (r) => r.status === JOB_STATUS.COMPLETED
    ).length;
    return completedCount * 25;
  }, [Object.values(results).map((r) => r.status)]);

  trpc.progress.streamProgress.useSubscription(undefined, {
    onData: (data) => {
      setResults((prev) => ({
        ...prev,
        ...data,
      }));
    },
  });

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
                {Object.entries(results).map(([key, result]) => (
                  <CalculationResultRow
                    key={key}
                    operation={`A ${
                      key === "sum"
                        ? "+"
                        : key === "difference"
                        ? "-"
                        : key === "product"
                        ? "*"
                        : "/"
                    } B`}
                    result={result}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
