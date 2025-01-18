import type { JobOperationType } from '@/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const doCalculation = async ({
  number_a,
  number_b,
  operation,
}: {
  number_a: number;
  number_b: number;
  operation: JobOperationType;
}) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Calculate the ${operation} of ${number_a} and ${number_b}. Return your response in JSON format using exactly this structure: { "result": calculation_result }. Only return the JSON, with no additional text.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = JSON.parse(completion.choices[0].message.content ?? '{}');

  if (typeof content === 'object' && content.result !== undefined) {
    // check if content.result can be parsed as a number
    const result = Number(content.result);
    if (!Number.isNaN(result)) {
      return result;
    }
  }
  throw new Error('OpenAI returned invalid result');
};
