import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID that persists for the browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Cache user ID to avoid repeated auth calls
let cachedUserId: string | null = null;

export const useAnalytics = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();
    const pagePath = location.pathname;
    pageStartTime.current = Date.now();

    // CRITICAL: Defer analytics to not block page rendering
    setTimeout(async () => {
      try {
        // Use cached user ID if available
        if (!cachedUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          cachedUserId = user?.id || null;
        }
        
        // Fire and forget - don't await, silent fail
        supabase.from('analytics_events').insert({
          session_id: sessionId,
          event_type: 'page_view',
          page_path: pagePath,
          user_id: cachedUserId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // Silent fail
      }
    }, 0);

    // Track page exit on cleanup
    return () => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
      
      // Use setTimeout to not block navigation
      setTimeout(() => {
        try {
          supabase.from('analytics_events').insert({
            session_id: sessionId,
            event_type: 'page_exit',
            page_path: pagePath,
            user_id: cachedUserId,
            duration_seconds: duration,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Silent fail
        }
      }, 0);
    };
  }, [location.pathname]);
};
