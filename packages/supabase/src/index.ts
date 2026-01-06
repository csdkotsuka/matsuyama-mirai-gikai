// Export types
export type { Database } from "../types/supabase.types";

// Framework-agnostic clients
export { createAdminClient } from "./admin";
export { createClient as createBrowserClient } from "./browser";
// Note: server client is not exported here to prevent client-side bundling
// Import directly from "./server" in server components
