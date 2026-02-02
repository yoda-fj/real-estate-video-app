'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Cliente para Client Components (hooks, páginas com 'use client')
export function getSupabaseBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
