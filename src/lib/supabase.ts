import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedTrip {
  id: string;
  user_id: string;
  title: string;
  state: string | null;
  duration: number | null;
  budget: 'budget' | 'mid' | 'luxury' | null;
  itinerary: Record<string, unknown>;
  created_at: string;
}
