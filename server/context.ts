import { supabase } from "@/lib/supabase";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export function createContext(opts: FetchCreateContextFnOptions) {
  return {
    supabase,
    req: opts.req,
  };
}
