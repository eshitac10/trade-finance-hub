import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

let sessionId = '';

// Generate session ID on module load
if (typeof window !== 'undefined') {
  sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useAnalyticsTracking = () => {
  const location = useLocation();
  const pageLoadTime = useRef<number>(Date.now());

  useEffect(() => {
    const trackPageView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track page entry
      await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        event_type: 'page_view',
        page_path: location.pathname,
        timestamp: new Date().toISOString()
      });

      pageLoadTime.current = Date.now();
    };

    trackPageView();

    // Track page exit and duration on cleanup
    return () => {
      const duration = Math.floor((Date.now() - pageLoadTime.current) / 1000);
      
      supabase.from('analytics_events').insert({
        user_id: null,
        session_id: sessionId,
        event_type: 'page_exit',
        page_path: location.pathname,
        duration_seconds: duration,
        timestamp: new Date().toISOString()
      }).then(() => {});
    };
  }, [location.pathname]);
};
