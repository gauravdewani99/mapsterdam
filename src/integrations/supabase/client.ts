import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// The Supabase backend is optional. It only powers the AI clue feature
// (the `generate-clue` edge function, which needs a server-side OpenAI key).
// When it isn't configured the game runs normally with hand-written clues,
// so a missing or dead backend must never block startup.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!isSupabaseConfigured) {
  console.info(
    'Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). ' +
      'AI-generated clues are disabled; falling back to static clues.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
