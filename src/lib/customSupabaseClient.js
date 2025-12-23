import { createClient } from '@supabase/supabase-js';
import {config} from "@/lib/config.js";

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;
const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
