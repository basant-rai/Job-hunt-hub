// /js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://ctaopcnqedchqdetovzz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YW9wY25xZWRjaHFkZXRvdnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NTAxMjgsImV4cCI6MjA3MTMyNjEyOH0.U52jbnISt7bdo2mN2kqLeDQczDaDJm0PILJxZ1Bnk9k";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// optional: expose globally if you want in console
window.supabaseClient = supabaseClient;

export { supabaseClient };
