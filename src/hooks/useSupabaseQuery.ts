import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface SupabaseQueryState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export interface SupabaseCRUD<T> extends SupabaseQueryState<T> {
  refresh: () => Promise<void>;
  insert: (item: Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<T | null>;
  update: (id: string, patch: Partial<T>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

/**
 * Hook genérico para CRUD no Supabase.
 * Requer estar dentro de <AuthProvider>.
 */
export function useSupabaseQuery<T extends { id: string; user_id: string }>(
  table: string,
  initialData: T[],
  options?: {
    orderBy?: { column: string; ascending?: boolean };
    select?: string;
  }
): SupabaseCRUD<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let query = supabase
      .from(table)
      .select(options?.select ?? '*')
      .eq('user_id', user.id);

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      });
    }

    const { data: fetched, error: err } = await query;

    if (!mountedRef.current) return;

    if (err) {
      setError(err.message);
    } else if (Array.isArray(fetched)) {
      setData(fetched as unknown as T[]);
    } else {
      setData([]);
    }
    setLoading(false);
  }, [user, table, options?.select, options?.orderBy?.column, options?.orderBy?.ascending]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const insert = useCallback(
    async (item: Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<T | null> => {
      if (!user) return null;
      const { data: created, error: err } = await supabase
        .from(table)
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      const newItem = created as T;
      setData(prev => [newItem, ...prev]);
      return newItem;
    },
    [user, table]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>): Promise<boolean> => {
      if (!user) return false;
      const { error: err } = await supabase
        .from(table)
        .update(patch as Record<string, unknown>)
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) {
        setError(err.message);
        return false;
      }
      setData(prev =>
        prev.map(item => (item.id === id ? { ...item, ...patch } as T : item))
      );
      return true;
    },
    [user, table]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) {
        setError(err.message);
        return false;
      }
      setData(prev => prev.filter(item => item.id !== id));
      return true;
    },
    [user, table]
  );

  return { data, loading, error, refresh: fetchData, insert, update, remove };
}
