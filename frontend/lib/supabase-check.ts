// Utility to check if Supabase tables exist
let tablesExist: boolean | null = null;

export async function checkSupabaseTables(): Promise<boolean> {
  if (tablesExist !== null) return tablesExist;
  
  try {
    const { supabase } = await import('./supabase');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: _, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    tablesExist = !error || error.code !== 'PGRST116'; // PGRST116 = table not found
    return tablesExist;
  } catch {
    tablesExist = false;
    return false;
  }
}

// Reset the check (useful after running schema)
export function resetSupabaseCheck() {
  tablesExist = null;
}
