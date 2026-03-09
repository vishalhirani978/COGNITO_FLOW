<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
=======
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Paper {
  id: string;
  title: string;
  subject: string;
  year: number;
  teacher_name: string | null;
  file_content: string;
  uploaded_at: string;
  user_id: string | null;
}

export interface Topic {
  id: string;
  paper_id: string;
  topic_name: string;
  marks: number;
  question_count: number;
  keywords: string[];
}

export interface AnalysisCache {
  id: string;
  cache_key: string;
  analysis_data: unknown;
  created_at: string;
  expires_at: string;
}
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f
