'use server';

import { baseUrl } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { DB_JOB_STATUS, JOB_OPERATION, type JobOperationType } from '@/types';

export async function submitCalculation(formData: FormData) {
  const numberA = Number.parseFloat(formData.get('numberA') as string);
  const numberB = Number.parseFloat(formData.get('numberB') as string);

  // check if the numbers are valid
  if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
    throw new Error('Invalid numbers');
  }

  // Create all four calculations as separate jobs
  const operations: JobOperationType[] = [
    JOB_OPERATION.SUM,
    JOB_OPERATION.DIFFERENCE,
    JOB_OPERATION.PRODUCT,
    JOB_OPERATION.DIVISION,
  ];

  const { data, error } = await supabase
    .from('jobs')
    .insert(
      operations.map((operation) => ({
        operation,
        number_a: numberA,
        number_b: numberB,
        status: DB_JOB_STATUS.PENDING,
      })),
    )
    .select();

  if (error) {
    console.error('Error creating jobs:', error);
    throw error;
  }

  // Trigger the worker for each specific job
  for (const job of data) {
    await fetch(`${baseUrl}/api/worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: job.id }),
    });
  }

  return { success: true };
}
