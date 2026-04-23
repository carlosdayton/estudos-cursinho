import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  payment_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to query and manage user subscription status.
 * Queries the subscriptions table for the authenticated user.
 * 
 * @returns {UseSubscriptionReturn} Subscription data, loading state, and helper functions
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (err) {
        setError(err.message);
        setSubscription(null);
      } else {
        setSubscription(data as Subscription | null);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubscription(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSubscription();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchSubscription]);

  // Check if user has an active subscription (status is "approved")
  const hasActiveSubscription = subscription?.status === 'approved';

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    refresh: fetchSubscription,
  };
}
