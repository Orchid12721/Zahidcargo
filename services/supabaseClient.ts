
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rpnclsyqemijxgsfbzok.supabase.co';
// Using the valid JWT Anon Key provided earlier for client-side authentication
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbmNsc3lxZW1panhnc2Ziem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDc2NzEsImV4cCI6MjA3OTI4MzY3MX0.EBc29CfTk_37YuUeJostqn6CvQ48VvEx8Eie8Q4MzKA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
