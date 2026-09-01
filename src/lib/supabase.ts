import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_DEFAULT_URL = 'https://oemcgnokkzamajaloupo.supabase.co';
export const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbWNnbm9ra3phbWFqYWxvdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NzMwNTcsImV4cCI6MjEwMDI0OTA1N30.dJhtXrEQkVTHNDQ4aogpRizkwmQwk8dsbQcSiCjvjxw';
export const SUPABASE_DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_QP8B8RDxF_ocXu-QR8GQgA_QR_gmR8b';

function getInitialUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cekbu_supabase_url');
    if (stored && stored.trim()) return stored.trim();
  }
  return import.meta.env.VITE_SUPABASE_URL || SUPABASE_DEFAULT_URL;
}

function getInitialKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cekbu_supabase_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
}

const initialUrl = getInitialUrl();
const initialKey = getInitialKey();

let supabaseInstance: SupabaseClient | null = null;

try {
  if (initialUrl && initialKey) {
    supabaseInstance = createClient(initialUrl, initialKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
} catch (err) {
  console.warn('Failed to initialize default Supabase client:', err);
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = Boolean(
  initialUrl &&
  initialKey &&
  initialUrl !== 'https://your-project.supabase.co'
);

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    const url = getInitialUrl();
    const key = getInitialKey();
    if (url && key) {
      try {
        supabaseInstance = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
      } catch (err) {
        console.error('Error creating Supabase client:', err);
      }
    }
  }
  return supabaseInstance;
}

export function saveSupabaseCredentials(url: string, key: string): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('cekbu_supabase_url', url.trim());
      localStorage.setItem('cekbu_supabase_key', key.trim());
      supabaseInstance = createClient(url.trim(), key.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      return supabaseInstance;
    } else {
      localStorage.removeItem('cekbu_supabase_url');
      localStorage.removeItem('cekbu_supabase_key');
      supabaseInstance = createClient(SUPABASE_DEFAULT_URL, SUPABASE_DEFAULT_ANON_KEY);
      return supabaseInstance;
    }
  }
  return null;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; latencyMs: number; message: string; details?: any }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, latencyMs: 0, message: 'Supabase client is not initialized.' };
  }

  const startTime = Date.now();
  try {
    // Ping query to check connectivity
    const { data, error } = await client.from('churches').select('id, name').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      // Table might not exist yet if DDL hasn't been executed
      if (error.code === '42P01') {
        return {
          success: true,
          latencyMs,
          message: `Connected to Supabase endpoint (${latencyMs}ms). Note: Tables need to be initialized via SQL schema.`,
          details: error
        };
      }
      return {
        success: false,
        latencyMs,
        message: error.message || 'Supabase returned an error response.',
        details: error
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Successfully connected to Supabase live database (${latencyMs}ms latency).`,
      details: data
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Network error connecting to Supabase.',
      details: err
    };
  }
}


