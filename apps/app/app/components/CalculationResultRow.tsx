import type { CalculationResult } from '@/types';

interface CalculationResultRowProps {
  operation: string;
  result: CalculationResult;
}

export function CalculationResultRow({ operation, result }: CalculationResultRowProps) {
  return (
    <div className="flex whitespace-nowrap">
      <div className="w-24 text-right shrink-0">{operation} = </div>
      <div className="ml-2 min-w-[100px]">
        {result.status === 'computing' ? 'Computing...' : result.result}
      </div>
    </div>
  );
}
