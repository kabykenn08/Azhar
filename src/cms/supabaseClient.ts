import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'https://heuruzdnvasxjwdpsstw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldXJ1emRudmFzeGp3ZHBzc3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjY3NjcsImV4cCI6MjA4MDE0Mjc2N30.Zbwm_QNlPiNOnN1t0j_dkGa-w8YWzYip4ZS7gSpwaJg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);