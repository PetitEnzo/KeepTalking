import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let query = supabase.from(table).select(options?.select || '*');

        if (options?.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data, error } = await query;

        if (error) throw error;
        setData(data as T[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, JSON.stringify(options)]);

  return { data, loading, error };
}
