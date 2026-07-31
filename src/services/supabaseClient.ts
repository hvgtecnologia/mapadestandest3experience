import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcdfielbqvrowniyefku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGZpZWxicXZyb3duaXllZmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ4MjksImV4cCI6MjA4ODEyMDgyOX0.qJjyjgr3XrYMzlw99AcW8Oy-OvKIsvUl47DhsdgRq_4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

