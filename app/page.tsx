"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Form from "next/form";
import React from "react";

export default function AppForm() {
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<{
    sum: number | null;
    difference: number | null;
    product: number | null;
    division: number | null;
  }>({
    sum: null,
    difference: null,
    product: null,
    division: null,
  });

  // Frontend "Mock" computation
  const computeResults = (formData: FormData) => {
    // Reset results
    setResults({
      sum: null,
      difference: null,
      product: null,
      division: null,
    });

    setProgress(0);
    const a = parseFloat(formData.get("numberA") as string);
    const b = parseFloat(formData.get("numberB") as string);

    // First calculation (immediate)
    setProgress(25);
    setResults((prev) => ({
      ...prev,
      sum: a + b,
    }));

    // Second calculation (after 3s)
    setTimeout(() => {
      setProgress(50);
      setResults((prev) => ({
        ...prev,
        difference: a - b,
      }));

      // Third calculation (after 6s)
      setTimeout(() => {
        setProgress(75);
        setResults((prev) => ({
          ...prev,
          product: a * b,
        }));

        // Fourth calculation (after 9s)
        setTimeout(() => {
          setProgress(100);
          setResults((prev) => ({
            ...prev,
            division: a / b,
          }));
        }, 3000);
      }, 3000);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8 pt-12">
        <Form action={computeResults}>
          <div className="flex gap-8 items-center justify-center">
            <Input
              placeholder="Enter number A"
              type="number"
              className="w-48"
              name="numberA"
              required
            />
            <Input
              placeholder="Enter number B"
              type="number"
              className="w-48"
              name="numberB"
              required
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Compute</Button>
          </div>
        </Form>

        {progress > 0 && (
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
                    {results.sum ?? "Computing..."}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A - B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.difference ?? "Computing..."}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A * B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.product ?? "Computing..."}
                  </div>
                </div>
                <div className="flex whitespace-nowrap">
                  <div className="w-24 text-right shrink-0">A / B = </div>
                  <div className="ml-2 min-w-[100px]">
                    {results.division ?? "Computing..."}
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
