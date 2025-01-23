import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL) {
	throw new Error("Missing SUPABASE_URL");
}
if (!SUPABASE_ANON_KEY) {
	throw new Error("Missing SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
