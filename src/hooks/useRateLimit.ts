
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useRateLimit() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = async (endpoint: string, limit: number = 10) => {
    if (!user) return false;

    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_endpoint: endpoint,
        p_limit: limit,
        p_window_minutes: 60
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to prevent blocking
      }

      if (!data) {
        toast({
          title: "Rate Limit Exceeded",
          description: `You have exceeded the rate limit for ${endpoint}. Please try again later.`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    } finally {
      setIsChecking(false);
    }
  };

  return { checkRateLimit, isChecking };
}
