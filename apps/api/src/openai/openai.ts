import OpenAI from "openai";
import type { JobOperationType } from "@shared/types";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
	throw new Error("Missing OPENAI_API_KEY");
}

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
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
		model: "gpt-4o-mini",
		messages: [
			{
				role: "user",
				content: `Calculate the ${operation} of ${number_a} and ${number_b}. Return your response in JSON format using exactly this structure: { "result": calculation_result }. Only return the JSON, with no additional text.`,
			},
		],
		response_format: { type: "json_object" },
	});

	const content = JSON.parse(completion.choices[0].message.content ?? "{}");

	if (typeof content === "object" && content.result !== undefined) {
		// check if content.result can be parsed as a number
		const result = Number(content.result);
		if (!Number.isNaN(result)) {
			return result;
		}
	}
	throw new Error("OpenAI returned invalid result");
};
