import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseAuthClientOptions,
  getSupabaseUrl,
} from "./config";

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    getSupabaseAuthClientOptions()
  );
}
