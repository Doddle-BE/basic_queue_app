export const DB_JOB_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type DBJobStatus = keyof typeof DB_JOB_STATUS;
export type DBJobStatusType = (typeof DB_JOB_STATUS)[DBJobStatus];

export const JOB_STATUS = {
  IDLE: "idle",
  COMPUTING: "computing",
  COMPLETED: "completed",
  ERROR: "error",
} as const;
export type JobStatus = keyof typeof JOB_STATUS;
export type JobStatusType = (typeof JOB_STATUS)[JobStatus];

export const JOB_OPERATION = {
  SUM: "sum",
  DIFFERENCE: "difference",
  PRODUCT: "product",
  DIVISION: "division",
} as const;
export type JobOperation = keyof typeof JOB_OPERATION;
export type JobOperationType = (typeof JOB_OPERATION)[JobOperation];

export type CalculationResult = {
  result: number | null;
  status: JobStatusType;
};

export type CalculationResults = {
  sum: CalculationResult;
  difference: CalculationResult;
  product: CalculationResult;
  division: CalculationResult;
};

export type Job = {
  id: string;
  operation: JobOperationType;
  number_a: number;
  number_b: number;
  result: number | null;
  status: JobStatusType;
  created_at: string;
};
