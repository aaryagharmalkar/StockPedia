// server/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Your Supabase project credentials
const SUPABASE_URL = "https://uwzjldpjuqkwlocsklgv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3empsZHBqdXFrd2xvY3NrbGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTEwMjgsImV4cCI6MjA3NzIyNzAyOH0.a3C14gcgLZGImK8y-wd7htgrt5hMCXgc2T2MzJkG3GE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
