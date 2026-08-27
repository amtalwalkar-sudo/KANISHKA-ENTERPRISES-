export function getSupabaseConfig(env = import.meta.env) {
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const error = new Error('SUPABASE_CONFIGURATION_MISSING');
    error.code = 'SUPABASE_CONFIGURATION_MISSING';
    throw error;
  }
  try { new URL(url); } catch {
    throw new Error('SUPABASE_URL_INVALID');
  }
  return { url, anonKey };
}

export function hasSupabaseConfig(env = import.meta.env) {
  return Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
}
