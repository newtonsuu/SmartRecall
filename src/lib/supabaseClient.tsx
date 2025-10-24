import { createClient } from "@supabase/supabase-js";
const VITE_SUPABASE_URL="https://eoffiddgxjiwiyihczed.supabase.co"
const VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZmZpZGRneGppd2l5aWhjemVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODg2ODUsImV4cCI6MjA3NjM2NDY4NX0.Q4HctGcsa3W7hzkjkUpfWX5Bwnd0qeVcnc43_d3iltE"

export const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
